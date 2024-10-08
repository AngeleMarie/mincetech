import ProblemReport from '../../models/problemModels.js/ProblemReport.js';



const createReport = async (req, res) => {
  const { firstName, lastName, email, message } = req.body;

  try {
    const report = new ProblemReport({ firstName, lastName, email, message });
    await report.save();
    res.status(200).json({ success: true, message: 'Report submitted successfully.' });
  } catch (error) {
    console.error('Error saving report:', error);
    res.status(500).json({ error: 'An error occurred while submitting the report.' });
  }
};
export default createReport