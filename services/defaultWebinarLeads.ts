import { WebinarLead, WebinarLeadsStats } from '../types';

export const SEED_WEBINAR_LEADS: Array<{ full_name: string; whatsapp_number: string; email: string }> = [
  { full_name: 'Abubakar Jafaru', whatsapp_number: '+2348033018708', email: 'jafaruabubakar027@gmail.com' },
  { full_name: 'Abubakar Lami', whatsapp_number: '+2348034546198', email: 'leaabubakar19@gmail.com' },
  { full_name: 'Abubakar Olanrewaju', whatsapp_number: '+2349127271407', email: 'olanrewajuabubaka@gmail.com' },
  { full_name: 'Abraham Oluwatimilehin Olorunda', whatsapp_number: '+18037232324', email: 'paudemic@gmail.com' },
  { full_name: 'Abosede Adijat Adekunle', whatsapp_number: '+2348080710105', email: 'abosedekunle@gmail.com' },
  { full_name: 'Abdullahi Balogun', whatsapp_number: '+2348169462229', email: 'abdullahikola@5gmail.com' },
  { full_name: 'Adeleke Jamiu Adewale', whatsapp_number: '+2348031349844', email: 'jamiuadeleke08@gmail.com' },
  { full_name: 'Adunni Adey Bello Adekunle Adegbenga', whatsapp_number: '+2347057933510', email: 'belloadekunle60@gmail.com' },
  { full_name: 'Afeni Owolabi', whatsapp_number: '+2348088884894', email: 'timileyinowolabi29@gmail.com' },
  { full_name: 'Akeem Adebayo', whatsapp_number: '+2347088881270', email: 'akeem4530@gmail.com' },
  { full_name: 'Akeem Animashaun Olamilekan', whatsapp_number: '+2348025657454', email: 'animashaunakeem24@gmail.com' },
  { full_name: 'Akinola Iyabo Sarah', whatsapp_number: '+2347065525745', email: 'amokemorenikejiakinola@gmail.com' },
  { full_name: 'Akinyemi Oluwole Abidakun', whatsapp_number: '+2347063268226', email: 'akinyemiabidakun@gmail.com' },
  { full_name: 'Alex Felicia', whatsapp_number: '+2348166245910', email: 'alexfelicia980@gmail.com' },
  { full_name: 'Alfa Jamiu Al Ilory', whatsapp_number: '+2348135824347', email: 'abdulganiyujamiyuakorede@gmail.com' },
  { full_name: 'Ali Reuben Uchenna', whatsapp_number: '+2348034048840', email: 'reubenali65@gmail.com' },
  { full_name: 'Anisulowo Oladele Joseph', whatsapp_number: '+2347030230935', email: 'anisulowobamidele827@gmail.com' },
  { full_name: 'Atinuke Fausat Odunowo', whatsapp_number: '+2347039138317', email: 'atinukefaosatodunowo@gmail.com' },
  { full_name: 'Augustine Agbator', whatsapp_number: '+18064735290', email: 'agbatoraugustine25@gmail.com' },
  { full_name: 'Ayangbola Michael', whatsapp_number: '+2348050221481', email: 'ayangbolamichaelgbenga@gmail.com' },
  { full_name: 'Balikis Ganiyu', whatsapp_number: '+2348163548017', email: 'balikisganiou@gmail.com' },
  { full_name: 'Bless Joe', whatsapp_number: '+2348148883084', email: 'jossycool74@gmail.com' },
  { full_name: 'Boniface Okechukwu Boniface Agu', whatsapp_number: '+2347039492410', email: 'udeewoagu@gmail.com' },
  { full_name: 'Caroline Orieyineka David', whatsapp_number: '+2348085600398', email: 'carolinedavid561@gmail.com' },
  { full_name: 'Chiamaka Florence Ogunjiofor', whatsapp_number: '+2348167771962', email: 'ogunjioforchiamaka147@gmail.com' },
  { full_name: 'Dauda Ahmad', whatsapp_number: '+2348032670069', email: 'ahamaddauda489@gmail.com' },
  { full_name: 'Dele Telejaye', whatsapp_number: '+17018123575', email: 'deletelejaye@gmail.com' },
  { full_name: 'Dotun Daniyan', whatsapp_number: '+2347069593062', email: 'daniyandotun7@gmail.com' },
  { full_name: 'Ebenezer Gbenga', whatsapp_number: '+2348064196518', email: 'ebenezergbengajessie@gmail.com' },
  { full_name: 'Emeagi Chinyere', whatsapp_number: '+2348068145968', email: 'chinyereebelechukwu1@gmail.com' },
  { full_name: 'Emmanuel', whatsapp_number: '+2347069193367', email: 'nueldare01@gmail.com' },
  { full_name: 'Emmasa Ola Emmanuel', whatsapp_number: '+17062657274', email: 'emmanuelemmasa4@gmail.com' },
  { full_name: 'Falowo Serah', whatsapp_number: '+2348166715869', email: 'serahfalowo1@gmail.com' },
  { full_name: 'Felix Nwokedi', whatsapp_number: '+2348033432775', email: 'nwokedif22@gmail.com' },
  { full_name: 'Folake Awojobi', whatsapp_number: '+2348137242059', email: 'folakemiawojobi930@gmail.com' },
  { full_name: 'Folashade Lawal', whatsapp_number: '+2348064635318', email: 'folasadelawal16@gmail.com' },
  { full_name: 'Francis Monye', whatsapp_number: '+2348038271998', email: 'francismonye40@gmail.com' },
  { full_name: 'Gladys Akinmurele Hafsat Musa', whatsapp_number: '+2348032624755', email: 'hafsat.musa93@gmail.com' },
  { full_name: 'Godgifte Awori Okpahe', whatsapp_number: '+2347040191957', email: 'godgiftawori1@gmail.com' },
  { full_name: 'Henry Ndubuisi Okolie', whatsapp_number: '+2348033422200', email: 'henryndubuisiokolie@gmail2026.com' },
  { full_name: 'Ifeco Holdings', whatsapp_number: '+2347039968498', email: 'ifeco4g@gmail.com' },
  { full_name: 'Ismaila Danladi', whatsapp_number: '+2348152054042', email: 'ismailadanladi03@gmail.com' },
  { full_name: 'Janet Jackson', whatsapp_number: '+2348057031726', email: 'adekunlegbadebo@gmail.com' },
  { full_name: 'Jidonu Elidja', whatsapp_number: '+2347051164377', email: 'jidonuelijah326@gmail.com' },
  { full_name: 'John Agbedo', whatsapp_number: '+2349036952609', email: 'johnagbedo1@gmail.com' },
  { full_name: 'Joseph Ogunleye', whatsapp_number: '+2348056712210', email: 'Olukayodejoseph07@gmail.com' },
  { full_name: 'Joseph Umoren', whatsapp_number: '+2348064734157', email: 'jumoren80@gmail.com' },
  { full_name: 'Kabiru Abdulganiyu', whatsapp_number: '+2348037262272', email: 'kabiruabdulganiyu205@gmail.com' },
  { full_name: 'Kabiru Titilope', whatsapp_number: '+2347055197742', email: 'camara_tmoney@yahoo.com' },
  { full_name: 'Kareemot Oloyede', whatsapp_number: '+2348027272696', email: 'karimotoloyede65@gmail.com' },
  { full_name: 'Kayode Ayinde', whatsapp_number: '+2348062070108', email: 'christopherayinde66@gmail.com' },
  { full_name: 'Kenechukwu Jude', whatsapp_number: '+2348060658089', email: 'bessedkc@gmail.com' },
  { full_name: 'Kike Lameed', whatsapp_number: '+2348027170871', email: 'kikelameed4@gmail.com' },
  { full_name: 'Komolafe Henry', whatsapp_number: '+2347032435727', email: 'komolafehenry1234@gmail.com' },
  { full_name: 'Kuju Solomon Yemayinse', whatsapp_number: '+2349034190105', email: 'kujusolomon71@gmail.com' },
  { full_name: 'Lawal Itopa Ismaila', whatsapp_number: '+2348167406599', email: 'lawalismaila475@gm.com' },
  { full_name: 'Lawal Saliu', whatsapp_number: '+2347033051803', email: 'saliulawal01@gmail.com' },
  { full_name: 'Mohamed Bashir', whatsapp_number: '+2348066268873', email: 'Ummeebashir2016@gmail.com' },
  { full_name: 'Modina Bola Sulaiman', whatsapp_number: '+2349038330094', email: 'sulaimonbola@gmail.com' },
  { full_name: 'Muhammad Haliru Bunza', whatsapp_number: '+2347034770747', email: 'mhalirubunza@gmail.com' },
  { full_name: 'Muhammadu Aliyurijau', whatsapp_number: '+2348163509203', email: 'muhammadualiyu066@gmail.com' },
  { full_name: 'Musibau Adekola', whatsapp_number: '+2348063222828', email: 'musbau@gmail.com' },
  { full_name: 'Mutiu Waheed', whatsapp_number: '+2347037737190', email: 'mutiuwaheed620@gmail.com' },
  { full_name: 'Ngozi Omega', whatsapp_number: '+2347064533500', email: 'ikenyib95@gmail.com' },
  { full_name: 'Ngozi Victor', whatsapp_number: '+2348060878473', email: 'ngozivictor108@gmail.com' },
  { full_name: 'Ogunjimi Olapeju Ojelabi', whatsapp_number: '+2348139176447', email: 'ceciliaolapejuojelabi@gmail.com' },
  { full_name: 'Olajide Ayodele', whatsapp_number: '+2349052087016', email: 'olajideayodele2000@gmail.com' },
  { full_name: 'Oladele Daniel', whatsapp_number: '+18152148977', email: 'damideleoladele@gmail.com' },
  { full_name: 'Olawale Joseph', whatsapp_number: '+2348053582889', email: 'josepholawalegoal@gmail.com' },
  { full_name: 'Olurounke Mary', whatsapp_number: '+2347047107962', email: 'maryolurounke@gmail.com' },
  { full_name: 'Oluwatoyin Matthew', whatsapp_number: '+2347032614540', email: 'toyinmatts85@gmail.com' },
  { full_name: 'Omoboriowo Damilola', whatsapp_number: '+2347054935208', email: 'boriowo.dami@gmail.com' },
  { full_name: 'Ossy', whatsapp_number: '+2348025985966', email: 'amadiossychukdz@gmail.com' },
  { full_name: 'Oyelami Mathew', whatsapp_number: '+2347057563385', email: 'oyelamiolabunmi@gmail.com' },
  { full_name: 'Peter Sumaila', whatsapp_number: '+2349065408166', email: 'petersumaila499@gmail.com' },
  { full_name: 'Rachel Adeyemo', whatsapp_number: '+2347062661148', email: 'radeyemo19@gmail.com' },
  { full_name: 'Razaq Bisiriyu', whatsapp_number: '+2348028288383', email: 'farmersgains@gmail.com' },
  { full_name: 'Samuel Enogun', whatsapp_number: '+2347082791824', email: 'enogunsamuel@gmail.com' },
  { full_name: 'Samuel Oladele Aleibah', whatsapp_number: '+2349022992946', email: 'samueloladelealeiba9@gmail.com' },
  { full_name: 'Samuel Samuel', whatsapp_number: '+2347035050638', email: 'samuelobasi099@gmail.com' },
  { full_name: 'Samuel Teidinyo', whatsapp_number: '+17039517495', email: 'teidinyosamuel@gmail.com' },
  { full_name: 'Shittu Fatimoh', whatsapp_number: '+2348084930747', email: 'shittufatimoh295@gmail.com' },
  { full_name: 'Suleiman Abubakar Bio', whatsapp_number: '+2348058752221', email: 'suleimanabubakarbio@gmail.com' },
  { full_name: 'Taiwo Adepoju', whatsapp_number: '+2347072069652', email: 'adepojutaiwogabreal@gmail.com' },
  { full_name: 'Taiwo Aje', whatsapp_number: '+2348167205688', email: 'taiwoaje386@gmail.com' },
  { full_name: 'Tajudeen Adesoye', whatsapp_number: '+2348032491631', email: 'adesoyetajudeen32@gmail.com' },
  { full_name: 'Taofeek Adesina Iseotan', whatsapp_number: '+2348025919567', email: 'iseotanadeshina27@gmail.com' },
  { full_name: 'Tina Esohe', whatsapp_number: '+2347033666184', email: 'mm717740@gmail.com' },
  { full_name: 'Ukah Gabriel', whatsapp_number: '+2348108681859', email: 'gabrielukah50@gmail.com' },
  { full_name: 'Umar Ogbo Bala', whatsapp_number: '+2348067846032', email: 'Balaumar17@yahoo.com' },
  { full_name: 'Ushie Elizabeth', whatsapp_number: '+2349023572616', email: 'Elizabethushie81@gmail.com' },
  { full_name: 'Victor Achima', whatsapp_number: '+17089015895', email: 'victorachima8@gmail.com' },
  { full_name: 'Victor Okeke', whatsapp_number: '+2348039482207', email: 'victorokeke818@gmail.com' },
  { full_name: 'Woli Rau u Jah', whatsapp_number: '+2348147161048', email: 'lonpemary771@gmail.com' },
  { full_name: 'Yakubu Aighufue', whatsapp_number: '+2348079927370', email: 'yakubuaighufue1@gmail.com' },
  { full_name: 'Yemi Tijani', whatsapp_number: '+2347049480910', email: 'adeyemitijani426@gmail.com' },
  { full_name: 'YK Balogun', whatsapp_number: '+2348030470486', email: 'yekinnikola111@gmail.com' }
];

export function getDefaultWebinarLeads(): WebinarLead[] {
  const now = new Date().toISOString();
  return SEED_WEBINAR_LEADS.map((item, idx) => ({
    id: idx + 1,
    full_name: item.full_name,
    whatsapp_number: item.whatsapp_number,
    email: item.email,
    call_status: 'Not Called',
    call_notes: null,
    called_at: null,
    follow_up_date: null,
    created_at: now,
    updated_at: now
  }));
}

export function computeWebinarStats(leads: WebinarLead[]): WebinarLeadsStats {
  const stats: WebinarLeadsStats = {
    total: leads.length,
    not_called: 0,
    registered: 0,
    needs_follow_up: 0,
    call_back_requested: 0,
    not_interested: 0,
    no_answer: 0,
    wrong_number: 0
  };

  for (const l of leads) {
    switch (l.call_status) {
      case 'Not Called':
        stats.not_called++;
        break;
      case 'Called — Registered':
        stats.registered++;
        break;
      case 'Called — Needs Follow Up':
        stats.needs_follow_up++;
        break;
      case 'Called — Call Back Requested':
        stats.call_back_requested++;
        break;
      case 'Called — Not Interested':
        stats.not_interested++;
        break;
      case 'Called — No Answer':
        stats.no_answer++;
        break;
      case 'Called — Wrong Number':
        stats.wrong_number++;
        break;
      default:
        stats.not_called++;
    }
  }

  return stats;
}
