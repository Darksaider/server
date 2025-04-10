import { google } from "googleapis";
import * as dotenv from "dotenv";
import { Context } from "elysia";

dotenv.config();

if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !process.env.GOOGLE_REDIRECT_URI) {
  throw new Error("Missing required environment variables for Google OAuth");
}

interface GoogleProfile {
  id: string;
  email: string;
  name: string;
  picture?: string;
  verified_email?: boolean;
}

const oAuth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI,
);

const authUrl = oAuth2Client.generateAuthUrl({
  access_type: "offline",
  scope: ["profile", "email"],
});

export const googleAuthControllerLogin = () => {
  return new Response(null, {
    status: 302,
    headers: { Location: authUrl },
  });
};

// Контекст Elysia з jwt
interface AuthContext extends Context {
  jwt: { sign: (payload: object) => Promise<string> };
}

export const googleAuthControllerCallback = async (ctx: AuthContext) => {
  const { query, set, jwt } = ctx;
  const { code } = query;
  if (!code) return new Response("Failed to get authorization code", { status: 400 });

  try {
    const { tokens } = await oAuth2Client.getToken(code as string);
    oAuth2Client.setCredentials(tokens);

    const googleResponse = await google.oauth2("v2").userinfo.get({ auth: oAuth2Client });
    const googleProfile = googleResponse.data as GoogleProfile;

    if (!googleProfile.email) {
      return new Response("Failed to get user email from Google", { status: 400 });
    }

    const user = { id: googleProfile.id, email: googleProfile.email, name: googleProfile.name };
    const token = await jwt.sign({ id: user.id, email: user.email });

    return new Response(null, {
      status: 302,
      headers: {
        Location: "/da",
        "Set-Cookie": `token=${token}; HttpOnly; Path=/; Max-Age=${60 * 60 * 24 * 7}; SameSite=Lax`,
      },
    });
  } catch (error) {
    console.error("Error during Google authentication:", error);
    return new Response("Authentication failed", { status: 500 });
  }
};
