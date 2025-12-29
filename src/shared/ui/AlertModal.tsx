import { ReactNode } from 'react'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

interface AlertModalProps {
  trigger?: ReactNode
  title: string
  description?: string
  footer?: ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void

  // className props
  className?: string
  headerClassName?: string
  titleClassName?: string
  descriptionClassName?: string
  footerClassName?: string
}

const AlertModal = ({
  trigger,
  title,
  description,
  footer,
  open,
  onOpenChange,
  className,
  headerClassName,
  titleClassName,
  descriptionClassName,
  footerClassName,
}: AlertModalProps) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      {trigger && <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>}
      <AlertDialogContent className={className}>
        <AlertDialogHeader className={headerClassName}>
          <AlertDialogTitle className={titleClassName}>
            {title}
          </AlertDialogTitle>
          {description && (
            <AlertDialogDescription className={descriptionClassName}>
              {description}
            </AlertDialogDescription>
          )}
        </AlertDialogHeader>
        {footer && (
          <AlertDialogFooter className={footerClassName}>
            {footer}
          </AlertDialogFooter>
        )}
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default AlertModal
