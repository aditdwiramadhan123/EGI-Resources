import { Router, Request, Response } from "express";

const router = Router();

router.post("/checkout", async (req: Request, res: Response) => {
  try {
    const { userId, amount } = req.body;

    // Simulasi proses payment
    await new Promise((resolve) => setTimeout(resolve, 1000));

    res.status(200).json({
      success: true,
      message: "Payment processed",
      data: { userId, amount },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
