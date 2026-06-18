import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import db from '../config/database';
import { supabase } from '../lib/supabaseClient';

export const register = async (req: Request, res: Response) => {
  console.log('Register endpoint hit:', req.body);
    
  try {
    const {
      full_name,
      email,
      phone,
      state,
      password,
      confirm_password,
      referral_code
    } = req.body;

    // Validate required fields
    if (!full_name || !email || !phone || 
      !state || !password || 
      !confirm_password) {
      return res.status(422).json({
        success: false,
        error: "All required fields must be provided"
      });
    }

    // Validate passwords match
    if (password !== confirm_password) {
      return res.status(422).json({
        success: false,
        error: "Passwords do not match"
      });
    }

    // Validate password length
    if (password.length < 8) {
      return res.status(422).json({
        success: false,
        error: "Password must be at least 8 characters"
      });
    }

    // Validate email both in PostgreSQL and Supabase
    let emailExists = false;
    try {
      const existingUser = await db.query(
        'SELECT id FROM users WHERE email = $1',
        [email.toLowerCase().trim()]
      );
      if (existingUser && existingUser.rows && existingUser.rows.length > 0) {
        emailExists = true;
      }
    } catch (e) {
      console.error('Postgres check email error:', e);
    }

    try {
      const { data: existingSupAgent, error: supFetchErr } = await supabase
        .from('agents')
        .select('id')
        .eq('email', email.toLowerCase().trim());
      
      if (existingSupAgent && existingSupAgent.length > 0) {
        emailExists = true;
      }
      if (supFetchErr) {
        console.error('Supabase check email error returned:', JSON.stringify(supFetchErr, null, 2));
      }
    } catch (e) {
      console.error('Supabase check email error caught:', e);
    }

    if (emailExists) {
      return res.status(409).json({
        success: false,
        error: "An account with this email already exists"
      });
    }

    // Hash password for compatibility with standard PostgreSQL hashed formats
    const password_hash = await bcrypt.hash(password, 12);

    // Generate unique ID
    const id = uuidv4();

    // Generate referral code: first name + 4 random digits
    const firstName = full_name
      .trim()
      .split(' ')[0]
      .toUpperCase();
    const randomDigits = Math.floor(
      1000 + Math.random() * 9000
    );
    const newReferralCode = `${firstName}${randomDigits}`;

    // Write newly registered agent to Supabase agents-table so that frontend and admin panels can immediately read it
    console.log('Writing newly registered agent to Supabase agents-table...');
    try {
      const { error: supInsertErr } = await supabase
        .from('agents')
        .insert([{
          id: id,
          name: full_name.trim(),
          email: email.toLowerCase().trim(),
          phone: phone.trim(),
          referral_code: newReferralCode,
          status: 'Pending',
          date_joined: new Date().toISOString(),
          total_sales: 0,
          total_commission: 0,
          available_balance: 0,
          pending_balance: 0,
          total_clicks: 0,
          total_leads: 0,
          location: state.trim(),
          password: password, // Store plain password so front-end login context can match it
          referred_by_code: referral_code || null
        }]);

      if (supInsertErr) {
         console.error('Supabase insert failed:', JSON.stringify(supInsertErr, null, 2));
      } else {
         console.log('Successfully registered agent on Supabase agents table!');
      }
    } catch (e) {
      console.error('Supabase agent registration error caught:', e);
    }

    // Check if referred_by exists
    let referred_by = null;
    try {
      if (referral_code) {
        const referrer = await db.query(
          `SELECT id FROM users WHERE referral_code = $1`,
          [referral_code.toUpperCase().trim()]
        );
        if (referrer && referrer.rows && referrer.rows.length > 0) {
          referred_by = referrer.rows[0].id;
        }
      }
    } catch (e) {
      console.error('Postgres find referrer error:', e);
    }

    // Generate email verification token
    const email_verification_token = uuidv4();

    // Insert new user to PostgreSQL
    let newUser = {
      id,
      full_name: full_name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      state: state.trim(),
      status: 'pending',
      referral_code: newReferralCode,
      created_at: new Date().toISOString()
    };

    try {
      const result = await db.query(
        `INSERT INTO users (
          id,
          full_name,
          email,
          phone,
          state,
          password_hash,
          role,
          status,
          referral_code,
          referred_by,
          email_verified,
          email_verification_token,
          password,
          created_at,
          updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6,
          'realtor', 'pending',
          $7, $8, FALSE, $9, $10,
          NOW(), NOW()
        ) RETURNING 
          id, full_name, email, phone, 
          state, status, referral_code,
          created_at`,
        [
          id,
          full_name.trim(),
          email.toLowerCase().trim(),
          phone.trim(),
          state.trim(),
          password_hash,
          newReferralCode,
          referred_by,
          email_verification_token,
          password
        ]
      );
      if (result && result.rows && result.rows[0]) {
        newUser = result.rows[0];
      } else {
        throw new Error('Database insert did not return any rows');
      }
    } catch (e) {
      console.error('PostgreSql insert user failed:', e);
      return res.status(500).json({
        success: false,
        error: "Server database registration failed. Please try again."
      });
    }

    try {
      // Notify all admins of new registration
      const admins = await db.query(
        `SELECT id FROM users 
         WHERE role IN ('admin', 'manager', 'support')`
      );

      if (admins && admins.rows && admins.rows.length > 0) {
        const notificationValues = admins.rows.map(admin => 
          `('${uuidv4()}', '${admin.id}', 'New Realtor Registration', 'A new realtor ${full_name.trim()} has registered and is pending approval.', 'approval', '/admin/realtors?status=pending', NOW())`
        ).join(', ');

        await db.query(
          `INSERT INTO notifications (
            id, user_id, title, message, 
            type, link, created_at
          ) VALUES ${notificationValues}`
        );
      }
    } catch (e) {
      console.error('Postgres admin notifications insertion failed:', e);
    }

    console.log('User created successfully:', newUser.id);

    return res.status(201).json({
      success: true,
      data: newUser,
      message: "Registration successful. Your account is pending approval."
    });

  } catch (error) {
    console.error('Registration processing error:', error);
    return res.status(500).json({
      success: false,
      error: "Registration failed. Please try again."
    });
  }
};
