# Используем официальный образ Python
FROM python:3.13

# Устанавливаем рабочую директорию в контейнере
WORKDIR /app

# Скачиваем и устанавливаем Blender
RUN wget https://download.blender.org/release/Blender4.0/blender-4.0.0-linux-x64.tar.xz && \
    tar -xf blender-4.0.0-linux-x64.tar.xz && \
    mv blender-4.0.0-linux-x64 /opt/blender

# Добавляем Blender в PATH
ENV PATH="/opt/blender:${PATH}"

# Устанавливаем зависимости
RUN apt-get update && \
    apt-get install -y \
    wget \
    libgl1-mesa-glx \
    libglib2.0-0 \
    libx11-6 \
    libx11-xcb1 \
    libfreetype6 \
    libsm6 \
    libxrender1 \
    libfontconfig1 \
    libxext6 \
    libxi6 \
    libxrandr2 \
    libraw1394-11 \
    libasound2 \
    libxkbcommon0 && \
    rm -rf /var/lib/apt/lists/*

# Отключаем ALSA, если не требуется
ENV SDL_AUDIODRIVER=dummy

# Копируем файлы проекта
COPY requirements.txt .

# Устанавливаем зависимости
RUN pip install --no-cache-dir -r requirements.txt

# Копируем весь код сервера
COPY . .

# Открываем порт
EXPOSE 5000

# Запускаем сервер
CMD ["python", "app.py"]
