import userModel from "../../models/userModel";
import validator from "validator";
import bcrypt from "bcrypt";

const adminSeeder = async () => {
    let name = process.env.ADMIN_NAME;
    let email = process.env.ADMIN_EMAIL;
    let password = process.env.ADMIN_PASSWORD;

    try {
        if (!name || !email || !password) {
            console.error("Invalid data");
            return;
        }

        const admins = await userModel.find({ admin: true });
        const isExist = await userModel.findOne({ email: email });

        if (admins.length > 0) {
            console.log("Is already have admin");
            return;
        } else {
            if (isExist) {
                console.log("Admin is already exist");
                return;
            }

            await createAdmin(name, email, password);
        };
    } catch (error) {
        console.error(`You have error: ${error}`)
    } finally {
        process.env.ADMIN_NAME = undefined;
        process.env.ADMIN_EMAIL = undefined;
        process.env.ADMIN_PASSWORD = undefined;

        name = "";
        email = "";
        password = "";
        console.log("Raw admin credentials have been completely purged from memory.");
    }
};

const createAdmin = async (name: string, email: string, password: string) => {
    try {
        console.log("We check of your data...")
        if (!validator.isEmail(email)) throw new Error("Invalid Email Format");;

        console.log("We create a super admin...")

        const hashedPassword: string = await bcrypt.hash(password, 12);
        const admin = new userModel({
            name, 
            email, 
            password: hashedPassword, 
            admin: true
        });

        await admin.save();

        console.log("Creational admin successfully");

    } catch (error) {
        throw error;
    }
};

export default adminSeeder;