import { User } from '../models/user.model';
import bcrypt from 'bcryptjs';

export const handleUserMessage = async (msg: any) => {
  try {
    const { type, payload } = JSON.parse(msg.content.toString());

    if (type === 'REGISTER_USER') {
      const { firstName, lastName, username, password, role } = payload;
      if (!firstName || !lastName || !username || !password) {
        console.warn('Missing required fields');
        return;
      }
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        console.warn('User already exists:', username);
        return;
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new User({ firstName, lastName, username, password: hashedPassword, role });
      await newUser.save();
      console.log('User registered:', username);
    }
  } catch (err) {
    console.error('Error processing message:', err);
  }
};