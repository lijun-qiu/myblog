---
title: python将图片生成视频
date: 2023-04-23
tags:
 - python
categories:
 - python将图片生成视频
---

## 突然想试试将图片生成视频
python有很好的模块能简单实现,记得先安装模块

```python
from moviepy.editor import ImageSequenceClip, AudioFileClip, CompositeAudioClip
import os
import cv2

# 获取图像文件列表
image_folder = './imgs/video/img'
images = [img for img in os.listdir(image_folder) if img.endswith(".jpg")]

# 设置视频参数
duration = 6  # 视频时长（秒）
fps = 4  # 视频帧率
num_frames = int(duration * fps)  # 视频帧数
num_images = len(images)  # 图像数量
image_duration = int(num_frames / num_images)  # 每张图像的帧数

# 创建视频帧列表
video_frames = []
for image in images:
    img_path = os.path.join(image_folder, image)
    img = cv2.imread(img_path)
    img = cv2.cvtColor(img, cv2.COLOR_RGB2BGR)  # 添加颜色空间转换代码
    for i in range(image_duration):
        video_frames.append(img)

# 创建视频剪辑
video_clip = ImageSequenceClip(video_frames, fps=fps)
video_clip = video_clip.set_duration(duration)

# 将音频添加到视频剪辑
audio_file = './imgs/video/mp3/qintian.mp3'
audio_clip = AudioFileClip(audio_file).subclip(0, duration) #控制视频时长,不然默认MP3的时长
video_clip = video_clip.set_audio(audio_clip)

# 将视频剪辑转换成视频文件
output_file = './imgs/video/output_video2.mp4'
video_clip.write_videofile(output_file, fps=fps, codec='libx264')
```
