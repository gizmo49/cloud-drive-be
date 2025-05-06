import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { IUser, User } from '../models/User';


class AuthService {

    private generateToken(user: IUser) {
        let token = jwt.sign({ user }, process.env.JWT_SECRET!);
        return token;
    }

    async register(email: string, password: string) {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            throw new Error('User already exists');
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = new User({
            email,
            password: hashedPassword
        });

        await user.save();
        const token = this.generateToken(user);

        return {
            token,
            user: {
                id: user._id,
                email: user.email
            }
        };
    }

    async login(email: string, password: string) {
        const user = await User.findOne({ email });
        if (!user) {
            throw new Error('Invalid credentials');
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new Error('Invalid credentials');
        }

        const token = this.generateToken(user);

        return {
            token,
            user: {
                id: user._id,
                email: user.email
            }
        };
    }


}

export default AuthService;