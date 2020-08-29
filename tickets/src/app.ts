import express from 'express'
import 'express-async-errors'
import cookieSession from 'cookie-session'
import { json } from 'body-parser'

import { errorHandler, NotFoundError, currentUser } from '@jsphbtst-tech/common'
import {
  createTicketRouter,
  showTicketRouter,
  showAllTicketsRouter,
  updateTicketsRouter
} from 'routes'


const app = express()
app.set('trust proxy', true) // trust traffic since it's in a proxy
app.use(json())
app.use(
  cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== 'test'
  })
)
app.use(currentUser)

app.use(createTicketRouter)
app.use(showTicketRouter)
app.use(showAllTicketsRouter)
app.use(updateTicketsRouter)

app.all('*', async (req, res) => {
  throw new NotFoundError()
})

app.use(errorHandler)

// Python Flask is that you???
export { app }