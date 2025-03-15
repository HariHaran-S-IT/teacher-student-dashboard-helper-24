
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';

interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  footerClassName?: string;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  delay?: number;
}

export const AnimatedCard = ({
  children,
  className,
  headerClassName,
  contentClassName,
  footerClassName,
  header,
  footer,
  delay = 0,
}: AnimatedCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.5, 
        ease: [0.16, 1, 0.3, 1],
        delay,
      }}
      className={cn('w-full', className)}
    >
      <Card className="glass-card overflow-hidden border-[0.5px] border-white/30">
        {header && (
          <CardHeader className={headerClassName}>
            {header}
          </CardHeader>
        )}
        <CardContent className={cn('p-6', contentClassName)}>
          {children}
        </CardContent>
        {footer && (
          <CardFooter className={cn('px-6 py-4', footerClassName)}>
            {footer}
          </CardFooter>
        )}
      </Card>
    </motion.div>
  );
};

export default AnimatedCard;
