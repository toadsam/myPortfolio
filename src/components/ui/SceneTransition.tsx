"use client";

import {AnimatePresence, motion} from "framer-motion";

interface Props {
  active: boolean;
  color?: string;
}

export function SceneTransition({active, color = "#0a0e1a"}: Props) {
  return (
    <AnimatePresence>
      {active ? (
        <motion.div
          animate={{opacity: 1}}
          className="pointer-events-none fixed inset-0 z-[70]"
          exit={{opacity: 0}}
          initial={{opacity: 0}}
          style={{backgroundColor: color}}
          transition={{duration: 0.38, ease: "easeInOut"}}
        />
      ) : null}
    </AnimatePresence>
  );
}
