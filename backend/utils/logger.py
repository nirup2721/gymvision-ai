import logging, sys
def setup_logger():
    logger = logging.getLogger("gymvision")
    logger.setLevel(logging.INFO)
    h = logging.StreamHandler(sys.stdout)
    h.setFormatter(logging.Formatter("%(asctime)s | %(levelname)s | %(message)s"))
    logger.addHandler(h)
    return logger
logger = setup_logger()
