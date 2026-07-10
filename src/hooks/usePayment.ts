import { useState } from 'react'
import { paymentService } from '@/services/payment/payment.service'
import type {
  PaymentOrderInput,
  PaymentVerificationInput,
  PaymentVerificationResult,
} from '@/services/payment/payment.types'
import { getErrorMessage } from '@/utils/errors'

/**
 * React-facing wrapper around paymentService. Pages use this instead of
 * importing paymentService directly so loading/error state is handled
 * consistently — but the underlying call graph is identical either way.
 */
export const usePayment = () => {
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const initiatePayment = async (input: PaymentOrderInput) => {
    setIsProcessing(true)
    setError(null)
    try {
      return await paymentService.initializePayment(input)
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to start payment.'))
      throw err
    } finally {
      setIsProcessing(false)
    }
  }

  const verifyPayment = async (input: PaymentVerificationInput): Promise<PaymentVerificationResult> => {
    setIsProcessing(true)
    setError(null)
    try {
      return await paymentService.verifyPayment(input)
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to verify payment.'))
      throw err
    } finally {
      setIsProcessing(false)
    }
  }

  return { initiatePayment, verifyPayment, isProcessing, error }
}
