export const fadeIn = {
  initial: {
    opacity: 0
  },
  animate: {
    opacity: 1,
    transition: {
      duration: 0.3
    }
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.2
    }
  }
};

export const slideUp = {
  initial: {
    opacity: 0,
    y: 20
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4
    }
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.3
    }
  }
};

export const staggerChildren = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export const rollDice = {
  initial: {
    rotate: 0
  },
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      ease: "easeInOut",
      repeat: 2
    }
  }
};

export const pulse = {
  initial: {
    scale: 1
  },
  animate: {
    scale: [1, 1.1, 1],
    transition: {
      duration: 0.3
    }
  }
}; 