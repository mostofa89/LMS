import logging
import time

logger = logging.getLogger(__name__)


class RequestLoggingMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        start = time.time()
        response = self.get_response(request)
        duration = round((time.time() - start) * 1000, 2)
        if request.path.startswith('/api/'):
            logger.info(f"{request.method} {request.path} → {response.status_code} [{duration}ms]")
        return response
