import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET || 'uybybygybgyuguvderderssresxxtcdyubbynnlumonbguvrv65r7t';

export default defineEventHandler(async (event) => {
  if (event.node.req.method === "OPTIONS") {
    return "";
  }

  const { token } = await readBody(event);
  
  try {
    // Verify the token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // TODO: Update your Database here!
    // Example: await db.users.update({ email: decoded.email }, { isVerified: true });
    
    return { success: true, ...decoded };
  } catch (err) {
    throw createError({ statusCode: 401, message: 'Invalid or expired token' });
  }
});