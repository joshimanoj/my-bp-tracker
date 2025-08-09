const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

module.exports = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('readings')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      console.error('Error fetching readings:', error);
      return res.status(500).json({ error: error.message });
    }

    res.status(200).json(data);
  } catch (err) {
    console.error('Server error:', err);
    resıştı