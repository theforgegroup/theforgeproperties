import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import db from '../config/database';

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

    // Check if email already exists
    const existingUser = await db.query(
      'SELECT id FROM users WHERE email = $1',
      [email.toLowerCase().trim()]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        success: false,
        error: "An account with this email already exists"
      });
    }

    // Hash password
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

    // Check if referred_by exists
    let referred_by = null;
    if (referral_code) {
      const referrer = await db.query(
        `SELECT id FROM users WHERE referral_code = $1`,
        [referral_code.toUpperCase().trim()]
      );
      if (referrer.rows.length > 0) {
        referred_by = referrer.rows[0].id;
      }
    }

    // Generate email verification token
    const email_verification_token = uuidv4();

    // Insert new user
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
        created_at,
        updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6,
        'realtor', 'pending',
        $7, $8, FALSE, $9,
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
        email_verification_token
      ]
    );

    const newUser = result.rows[0];

    // Notify all admins of new registration
    const admins = await db.query(
      `SELECT id FROM users 
       WHERE role IN ('admin', 'manager', 'support')`
    );

    if (admins.rows.length > 0) {
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

    console.log('User created successfully:', newUser.id);

    return res.status(201).json({
      success: true,
      data: newUser,
      message: "Registration successful. Your account is pending approval."
    });

  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      error: "Registration failed. Please try again."
    });
  }
};
