"use strict";
// import express, { Request, Response } from 'express';
// import bcrypt from 'bcrypt';
// import jwt from 'jsonwebtoken';
// import Admin from '../db/models/admin'
// const AdminRouter = express.Router();
// // Create a new admin
// AdminRouter.post('/', async (req: Request, res: Response) => {
//   try {
//     const { admin_name, email, password } = req.body;
//     // Validate required fields
//     if (!admin_name || !email || !password) {
//       return res.status(400).send({ message: 'Please fill in all required fields.' });
//     }
//     // Validate email format
//     if (!/\S+@\S+\.\S+/.test(email)) {
//       return res.status(400).send({ message: 'Please enter a valid email address.' });
//     }
//     // Check if admin with the same email already exists
//     const existingAdmin = await Admin.findOne({ where: { email } });
//     if (existingAdmin) {
//       return res.status(400).send({ message: 'Admin with this email already exists.' });
//     }
//     // Hash password
//     const hashedPassword = await bcrypt.hash(password, 10);
//     // Create admin
//     const createAdmin = await Admin.create({ admin_name, email, password: hashedPassword });
//     return res.status(200).send({ message: 'Admin created successfully', data: createAdmin });
//   } catch (error: any) {
//     console.error('Error in creating admin:', error);
//     return res.status(500).send({ message: `Error in creating admin: ${error.message}` });
//   }
// });
// // Admin login
// AdminRouter.post('/login', async (req: Request, res: Response) => {
//   try {
//     const { email, password } = req.body;
//     // Validate required fields
//     if (!email || !password) {
//       return res.status(400).send({ message: 'Please fill in all required fields.' });
//     }
//     // Find admin by email
//     const admin = await Admin.findOne({ where: { email } });
//     if (!admin) {
//       return res.status(400).send({ message: 'Invalid email or password.' });
//     }
//     // Compare passwords
//     const isPasswordValid = await bcrypt.compare(password, admin.password);
//     if (!isPasswordValid) {
//       return res.status(400).send({ message: 'Invalid email or password.' });
//     }
//     // Generate JWT
//     const token = jwt.sign({ id: admin.admin_id }, 'your_jwt_secret', { expiresIn: '1h' });
//     return res.status(200).send({ message: 'Login successful', token });
//   } catch (error: any) {
//     console.error('Error in admin login:', error);
//     return res.status(500).send({ message: `Error in admin login: ${error.message}` });
//   }
// });
// // Get admin by ID
// AdminRouter.get('/:id', async (req: Request, res: Response) => {
//   try {
//     const { id } = req.params;
//     const admin = await Admin.findOne({ where: { admin_id: id } });
//     if (!admin) {
//       return res.status(404).send({ message: 'Admin not found.' });
//     }
//     return res.status(200).send(admin);
//   } catch (error: any) {
//     console.error('Error in fetching admin by ID:', error);
//     return res.status(500).send({ message: `Error in fetching admin: ${error.message}` });
//   }
// });
// // Get all admins
// AdminRouter.get('/', async (req: Request, res: Response) => {
//   try {
//     const admins = await Admin.findAll();
//     return res.status(200).send(admins);
//   } catch (error: any) {
//     console.error('Error in fetching admins:', error);
//     return res.status(500).send({ message: `Error in fetching admins: ${error.message}` });
//   }
// });
// // Update admin
// AdminRouter.put('/:id', async (req: Request, res: Response) => {
//   try {
//     const { id } = req.params;
//     const { admin_name, email, password } = req.body;
//     const admin = await Admin.findOne({ where: { admin_id: id } });
//     if (!admin) {
//       return res.status(404).send({ message: 'Admin not found.' });
//     }
//     // Validate email format
//     if (email && !/\S+@\S+\.\S+/.test(email)) {
//       return res.status(400).send({ message: 'Please enter a valid email address.' });
//     }
//     // Check if admin with the same email already exists
//     if (email && email !== admin.email) {
//       const existingAdmin = await Admin.findOne({ where: { email } });
//       if (existingAdmin) {
//         return res.status(400).send({ message: 'Admin with this email already exists.' });
//       }
//     }
//     // Hash new password if provided
//     let updatedPassword = admin.password;
//     if (password) {
//       updatedPassword = await bcrypt.hash(password, 10);
//     }
//     // Update admin
//     await Admin.update({ admin_name, email, password: updatedPassword }, { where: { admin_id: id } });
//     return res.status(200).send({ message: 'Admin updated successfully' });
//   } catch (error: any) {
//     console.error('Error in updating admin:', error);
//     return res.status(500).send({ message: `Error in updating admin: ${error.message}` });
//   }
// });
// // Delete (soft delete) admin
// AdminRouter.delete('/:id', async (req: Request, res: Response) => {
//   try {
//     const { id } = req.params;
//     const admin = await Admin.findOne({ where: { admin_id: id } });
//     if (!admin) {
//       return res.status(404).send({ message: 'Admin not found.' });
//     }
//     // Soft delete admin
//     await Admin.destroy({ where: { admin_id: id } });
//     return res.status(200).send({ message: 'Admin deleted successfully' });
//   } catch (error: any) {
//     console.error('Error in deleting admin:', error);
//     return res.status(500).send({ message: `Error in deleting admin: ${error.message}` });
//   }
// });
// export default AdminRouter;
