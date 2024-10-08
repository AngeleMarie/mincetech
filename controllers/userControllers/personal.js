import Authentication from "../../models/userModels/AuthInfoSchema.js";
import PersonalInfo from "../../models/userModels/PersonalInfoSchema.js";
import personalValidator from "../../validators/PersonalValidator.js";

const basicRegistration = async (req, res) => {
  try {
    const { error } = personalValidator.validate(req.body);
    if (error) {
      return res
        .status(400)
        .json({ errors: error.details.map((detail) => detail.message) });
    }

    const { userId } = req.params;
    const { address, role, dateOfBirth, gender } = req.body;
    const profilePictureUrl = req.file
      ? `http://localhost:${process.env.PORT}/photos/${req.file.filename}`
      : null;

    const user = await Authentication.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const existingPersonalInfo = await PersonalInfo.findOne({ userId });
    if (existingPersonalInfo) {
      existingPersonalInfo.address = address || existingPersonalInfo.address;
      existingPersonalInfo.role = role || existingPersonalInfo.role;
      existingPersonalInfo.dateOfBirth =
        dateOfBirth || existingPersonalInfo.dateOfBirth;
      existingPersonalInfo.gender = gender || existingPersonalInfo.gender;
      if (profilePictureUrl) {
        existingPersonalInfo.profilePicture = profilePictureUrl;
      }
      await existingPersonalInfo.save();
      return res
        .status(200)
        .json({
          message: "Personal information updated successfully",
          personalInfo: existingPersonalInfo,
        });
    }

    const fullName = `${user.firstname} ${user.lastname}`;

    const personalInfo = new PersonalInfo({
      userId: user._id,
      fullName,
      address,
      role,
      dateOfBirth,
      gender,
      profilePicture: profilePictureUrl,
    });

    await personalInfo.save();

    res
      .status(201)
      .json({
        message: "Personal information registered successfully",
        personalInfo,
      });
  } catch (error) {
    console.error("Error registering personal information:", error);
    res.status(500).json({ error: "Server error" });
  }
};

export default basicRegistration;
