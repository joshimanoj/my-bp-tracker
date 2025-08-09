const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

module.exports = async (req, res) => {
  try {
    const { systolic, diastolic, heartRate } = req.body;
    if (!systolic || !diastolic || !heartRate) {
      return res.status(400).json({ error: 'Missing values' });
    }
    const date = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('readings')
      .insert([{ systolic, diastolic, heart_rate: heartRate, date }])
      .select();

    if (error) {
      console.error('Error adding reading:', error);
      return res.status(500).json({ error: error.message });
    }

    res.status(200).json(data[0]);
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};