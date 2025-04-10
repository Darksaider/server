// import { google } from "googleapis";
// import * as dotenv from "dotenv";
// import { Context } from "elysia";
// import prismaDb from '../prisma/prisma'
// dotenv.config();

// if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !process.env.GOOGLE_REDIRECT_URI) {
//   throw new Error("Missing required environment variables for Google OAuth");
// }

// interface GoogleProfile {
//   id: string;
//   email: string;
//   name: string;
//   picture?: string;
//   verified_email?: boolean;
// }

// interface UserTokens {
//   accessToken?: string;
//   refreshToken?: string;
//   expiryDate?: Date;
// }

// // Адаптуйте цей клас під ваше рішення для зберігання даних (MongoDB, PostgreSQL тощо)
// class UserRepository {
//   async saveUser(userId: string, email: string, name: string, tokens: UserTokens) {
//     // Зберігаємо користувача та токени у БД
//     await prismaDb.users.upsert(
//       { id: userId },
//       {
//         id: userId,
//         email: email,
//         name: name,
//         googleTokens: tokens,
//         updatedAt: new Date()
//       }
//     );
//     return { id: userId, email, name };
//   }
  
//   async getUserById(userId: string) {
//     return await prismaDb.users.findFirst(
//       {
//         where:{
//           id: userId
//         }
//       }
      
//   }

  
//   async getUserTokens(userId: string): Promise<UserTokens | null> {
//     const user = await this.getUserById(userId);
//     return user?.googleTokens || null;
//   }
  
//   async removeUserTokens(userId: string) {
//     await Database.users.update(
//       { id: userId },
//       { $unset: { googleTokens: "" }, updatedAt: new Date() }
//     );
//   }
// }

// const userRepository = new UserRepository();

// const oAuth2Client = new google.auth.OAuth2(
//   process.env.GOOGLE_CLIENT_ID,
//   process.env.GOOGLE_CLIENT_SECRET,
//   process.env.GOOGLE_REDIRECT_URI,
// );

// const authUrl = oAuth2Client.generateAuthUrl({
//   access_type: "offline",
//   prompt: "consent", // Завжди запитувати згоду - так ми отримаємо refresh_token
//   scope: ["profile", "email"],
// });

// export const googleAuthControllerLogin = () => {
//   return new Response(null, {
//     status: 302,
//     headers: { Location: authUrl },
//   });
// };

// // Контекст Elysia з jwt та auth
// interface AuthContext extends Context {
//   jwt: { 
//     sign: (payload: object) => Promise<string>,
//     verify: (token: string) => Promise<any>
//   };
// }

// export const googleAuthControllerCallback = async (ctx: AuthContext) => {
//   const { query, set, jwt } = ctx;
//   const { code } = query;
  
//   if (!code) return new Response("Failed to get authorization code", { status: 400 });
  
//   try {
//     const { tokens } = await oAuth2Client.getToken(code as string);
//     oAuth2Client.setCredentials(tokens);
    
//     const googleResponse = await google.oauth2("v2").userinfo.get({ auth: oAuth2Client });
//     const googleProfile = googleResponse.data as GoogleProfile;
    
//     if (!googleProfile.email) {
//       return new Response("Failed to get user email from Google", { status: 400 });
//     }
    
//     // Зберігаємо токени Google разом із даними користувача
//     const userTokens: UserTokens = {
//       accessToken: tokens.access_token,
//       refreshToken: tokens.refresh_token,
//       expiryDate: tokens.expiry_date ? new Date(tokens.expiry_date) : undefined
//     };
    
//     const user = await userRepository.saveUser(
//       googleProfile.id, 
//       googleProfile.email, 
//       googleProfile.name || "", 
//       userTokens
//     );
    
//     // Створюємо JWT для автентифікації на клієнті
//     const jwtToken = await jwt.sign({ id: user.id, email: user.email });
//     const clientLocation = "http://localhost:5173";
    
//     return new Response(null, {
//       status: 302,
//       headers: {
//         Location: `${clientLocation}`,
//         "Set-Cookie": `token=${jwtToken}; HttpOnly; Path=/; Max-Age=${60 * 60 * 24 * 7}; SameSite=Lax`,
//       },
//     });
//   } catch (error) {
//     console.error("Error during Google authentication:", error);
//     return new Response("Authentication failed", { status: 500 });
//   }
// };

// export const googleAuthControllerLogout = async (ctx: AuthContext) => {
//   const { request, jwt } = ctx;
  
//   try {
//     // Отримуємо JWT з cookie
//     const cookieHeader = request.headers.get('cookie');
//     const tokenCookie = cookieHeader?.split(';').find(c => c.trim().startsWith('token='));
//     const jwtToken = tokenCookie?.split('=')[1];
    
//     if (jwtToken) {
//       // Верифікуємо JWT щоб отримати ID користувача
//       try {
//         const decoded = await jwt.verify(jwtToken);
//         const userId = decoded.id;
        
//         // Отримуємо токени Google з бази даних
//         const userTokens = await userRepository.getUserTokens(userId);
        
//         // Скасовуємо токен Google, якщо він є
//         if (userTokens?.accessToken) {
//           try {
//             await oAuth2Client.revokeToken(userTokens.accessToken);
//             console.log("Google token revoked successfully");
//           } catch (revokeError) {
//             console.error("Error revoking Google token:", revokeError);
//           }
//         }
        
//         // Видаляємо токени Google з бази даних
//         await userRepository.removeUserTokens(userId);
//       } catch (jwtError) {
//         console.error("Error verifying JWT token:", jwtError);
//       }
//     }
//   } catch (error) {
//     console.error("Error during logout:", error);
//   }
  
//   // Видаляємо JWT cookie в будь-якому випадку
//   return new Response(null, {
//     status: 302,
//     headers: {
//       Location: "http://localhost:5173", // Перенаправлення на головну сторінку
//       "Set-Cookie": "token=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax", // Видалення cookie
//     },
//   });
// };

// // Додаткова функція для перевірки автентифікації у middleware
// export const isAuthenticated = async (ctx: AuthContext, next: () => Promise<any>) => {
//   const { request, jwt, set } = ctx;
  
//   const cookieHeader = request.headers.get('cookie');
//   const tokenCookie = cookieHeader?.split(';').find(c => c.trim().startsWith('token='));
//   const jwtToken = tokenCookie?.split('=')[1];
  
//   if (!jwtToken) {
//     return new Response("Unauthorized", { status: 401 });
//   }
  
//   try {
//     const decoded = await jwt.verify(jwtToken);
//     ctx.user = decoded; // Додаємо користувача до контексту
//     return next();
//   } catch (error) {
//     return new Response("Invalid token", { status: 401 });
//   }
// };