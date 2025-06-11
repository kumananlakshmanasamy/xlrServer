import express, { Request, Response } from 'express';
import Agent from '../db/models/agent';

const routerAgent = express.Router();

routerAgent.post('/', async (req: Request, res: Response) => {
  try {
    const { user_id, company_name, company_number, company_address, user_name } = req.body;

    // Basic field validation
    if (!user_id || !company_name || !company_number || !company_address|| !user_name) {
      return res.status(400).json({
        success: false,
        error: 'All fields (user_id, company_name, company_number, company_address) are required.'
      });
    }

    const agent = await Agent.create({
      user_id,
      company_name,
      company_number,
      company_address,
      commission_earned: 0,
      total_referrals_done: 0,
      user_name
    });

    res.status(201).json({ success: true, data: agent });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});


routerAgent.get('/', async (_req: Request, res: Response) => {
  try {
    const agents = await Agent.findAll();
    res.json({ success: true, data: agents });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});


routerAgent.get('/:user_id', async (req: Request, res: Response) => {
  try {
    const { user_id } = req.params;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        error: 'user_id is required in params.'
      });
    }

    const agent = await Agent.findOne({ where: { user_id } });

    if (!agent) {
      return res.status(404).json({ success: false, message: 'Agent not found' });
    }

    res.json({ success: true, data: agent });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});


routerAgent.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Agent ID is required in params.'
      });
    }

    const [updated] = await Agent.update(updates, {
      where: { id }
    });

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Agent not found or no changes made.' });
    }

    const updatedAgent = await Agent.findByPk(id);
    res.json({ success: true, data: updatedAgent });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});


routerAgent.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Agent ID is required in params.'
      });
    }

    const deleted = await Agent.destroy({ where: { id } });

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Agent not found' });
    }

    res.json({ success: true, message: 'Agent deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default routerAgent;
