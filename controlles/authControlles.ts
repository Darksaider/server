// googleAuth.ts
import { google } from "googleapis";
import * as dotenv from "dotenv";
import { Context } from "elysia";
import prismaDb from "../bd/prisma/prisma";
dotenv.config();

const oAuth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI,
);

const authUrl = oAuth2Client.generateAuthUrl({
  access_type: "offline",
  scope: ["profile", "email"],
});

export const googleAuthContollesLogin = () => {
  return new Response(null, {
    status: 302,
    headers: {
      Location: authUrl,
    },
  });
};

export const googleAuthContollesCalback = async ({ query, set }: Context) => {
  const { code } = query;
  if (!code) {
    return "Failed to get code";
  }

  try {
    const { tokens } = await oAuth2Client.getToken(code as string);
    oAuth2Client.setCredentials(tokens);

    const googleProfile = await google
      .oauth2("v2")
      .userinfo.get({ auth: oAuth2Client });

    set.status = 200;
    return { success: true, user: googleProfile.data };
  } catch (error) {
    console.error("Error retrieving access token:", error);
    set.status = 400;
    return { success: false, error };
  }
};
