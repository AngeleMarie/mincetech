import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import Authentication from '../models/userModels/AuthInfoSchema.js';

export const initializePassport = () => {
  passport.use(new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Find the user based on their Google ID
        let user = await Authentication.findOne({ googleId: profile.id });

        if (!user) {
          // If the user does not exist, create a new user
          user = new Authentication({
            googleId: profile.id,
            email: profile.emails[0].value,
            firstname: profile.name.givenName,
            lastname: profile.name.familyName,
            isConfirmed: true,
          });

          await user.save();
        }

        // User exists or has been created, proceed with authentication
        return done(null, user);
      } catch (err) {
        console.error("Error during Google OAuth:", err);
        return done(err, null);
      }
    }
  ));

  // Serialize user information into the session
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // Deserialize user information from the session
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await Authentication.findById(id);
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });
};
