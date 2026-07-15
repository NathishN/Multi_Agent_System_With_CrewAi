FROM python:3.12-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    CREW_VERBOSE=false


COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY crewai_patch.py service.py crew.py main.py ./
COPY agents/ ./agents/
COPY tasks/ ./tasks/
COPY tools/ ./tools/
COPY api/ ./api/
COPY frontend/ ./frontend/

EXPOSE 8000

CMD ["uvicorn", "api.app:app", "--host", "0.0.0.0", "--port", "8000"]
