import express, { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { body } from 'express-validator'
import mongoose from 'mongoose'
import { User } from 'models'
import { validateRequest, BadRequestError } from '@jsphbtst-tech/common'
import { Password } from 'services/password'

const router = express.Router()

router.post(
  '/api/users/signin',
  [
    body('email').isEmail().withMessage('Email must be valid'),
    body('password').trim().notEmpty().withMessage('Please supply a password')
  ],
  validateRequest,
  async (req: Request, res: Response) => {

    const { email, password } = req.body
    const user = await User.findOne({ email })
    if (!user) {
      throw new BadRequestError('Invalid credentials')
    }

    const passwordsMatch = await Password.compare(user.password, password)
    if (!passwordsMatch) {
      throw new BadRequestError('Invalid credentials')
    }

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

    res.status(200).send(user)
  }
)

export { router as signinRouter }