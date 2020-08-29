import express, { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { body } from 'express-validator'
import { User } from 'models'
import { validateRequest, BadRequestError } from '@jsphbtst-tech/common'

const router = express.Router()

router.post(
  '/api/users/signup', 
  [
    body('email').isEmail().withMessage('Email must be valid'),
    body('password').trim().isLength({ min: 4, max: 20 }).withMessage('Password must be between 4-20 chars')
  ], 
  validateRequest,
  async (req: Request, res: Response) => {

  const { email, password } = req.body
  const existingUser = await User.findOne({ email })
  if (existingUser) {
    throw new BadRequestError('User already exists')
  }

  const user = User.build({ email, password })
  await user.save()

  // generate webtoken and store
  const userJwt = jwt.sign(
    {
      id: user.id,
      email: user.email
    },
    process.env.JWT_KEY!
  )

  req.session = {
    jwt: userJwt
  }

  res.status(201).send(user)
})

export { router as signupRouter }