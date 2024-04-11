---
title: 小程序签名
date: 2024-04-09
tags:
 - uniapp
categories:
 - miniProgram
---

# uniapp中定义一个签名组件
```html
   <canvas class="mycanvas" :disable-scroll="true" @touchstart="touchstart" @touchmove="touchmove" @touchend="touchend" canvas-id="handWriting" />
    <canvas :style="{width:cavWidth +'px',height:cavWHeight +'px',position:'absolute',top:'200%'}" canvas-id="handWriting2"></canvas>
    <div class="btn">
      <span @click="reset"> <img class="img2" :src="buildStatic('/shouxinWillingness/reset.png')" alt=""></span>
      <span @click="finish"> <img class="img3" :src="buildStatic('/shouxinWillingness/preview.png')" alt=""></span>
    </div>
```
```js
 data(){
    return {
      canvasObj:{
            ctx:null, //绘图图像
            points:[],//路径点集合
            path:'',
            flag:false,
        },
      signSrc: '',
      width: '100',
      height: '100',
      cavWidth: 1200,
      cavWHeight: 800,
    }
  },
  mounted() {
    this.initDraw()
  },
  methods: {
    initDraw(){
      this.canvasObj.ctx = uni.createCanvasContext("handWriting",this);   //创建绘图对象
      //设置画笔样式
      this.canvasObj.ctx.lineWidth = 4;
      this.canvasObj.ctx.lineCap = "round"
      this.canvasObj.ctx.lineJoin = "round"
      this.canvasObj.flag=false
      this.clear()
    },
     reset(){
        this.clear()
     },

     touchstart(e){
        e.preventDefault()
        let startX = e.changedTouches[0].x;
        let startY = e.changedTouches[0].y;
        let startPoint = {X:startX,Y:startY};
        //由于uni对canvas的实现有所不同，这里需要把起点存起来
        this.canvasObj.points.push(startPoint);
        //每次触摸开始，开启新的路径
        this.canvasObj.ctx.beginPath();
    },
    touchmove(e){
        e.preventDefault()
        let moveX = e.changedTouches[0].x;
        let moveY = e.changedTouches[0].y;
        let movePoint = {X:moveX,Y:moveY};
        this.canvasObj.points.push(movePoint);//存点
        let len = this.canvasObj.points.length;
        if(len>=2){
            this.draw();//绘制路径
        }
                 
    },
    touchend(){    
      this.canvasObj.points=[];
    },

    draw() {
      let point1 = this.canvasObj.points[0]
      let point2 = this.canvasObj.points[1]
      this.canvasObj.points.shift()
      this.canvasObj.ctx.moveTo(point1.X, point1.Y)
      this.canvasObj.ctx.lineTo(point2.X, point2.Y)
      this.canvasObj.ctx.stroke()
      this.canvasObj.ctx.draw(true)
			this.canvasObj.flag=true
    },

    clear(){
      const that = this
        uni.getSystemInfo({
            success: function(res) {
              let canvasw = res.windowWidth;
              let canvash = res.windowHeight;
              that.canvasObj.ctx.clearRect(0, 0, canvasw, canvash);
              that.canvasObj.ctx.draw(false);
              that.canvasObj.flag=false
              //设置画笔样式
              that.canvasObj.ctx.lineWidth = 4;
              that.canvasObj.ctx.lineCap = "round"
              that.canvasObj.ctx.lineJoin = "round"
              that.canvasObj.ctx.lineJoin = "round"
          }
        })
    },
    finish(){
      const _this = this
      uni.canvasToTempFilePath({
        canvasId: 'handWriting',
        fileType: 'png',
        quality: 1, //图片质量
        success(res) {
          console.log({data:res.tempFilePath})
          _this.signSrc = res.tempFilePath
          _this.rote90(res.tempFilePath)
        }
      },_this)
    },
    rote90(path){
      uni.getImageInfo({
            // 获取图片的信息
            src: path,
            success: (info) => {
              console.log(666,info)
              const width = info.width;
              const height = info.height;
              this.cavWHeight = width
              this.cavWidth = height

              // 创建一个临时Canvas对象
              const ctx = uni.createCanvasContext('handWriting2',this);

              // 旋转并绘制图片
              ctx.translate(height / 2 ,width / 2); // 将坐标原点移动到图片中心
              ctx.rotate(-90 * Math.PI / 180); // 旋转90度
              ctx.drawImage(path,  - width / 2, - height / 2, width, height); // 绘制旋转后的图片
              ctx.draw()
              this.drawImage(ctx)
            }
          })
    },
    drawImage(ctx){
      let that = this
      setTimeout(()=>{
                 uni.canvasToTempFilePath({
                  canvasId: 'handWriting2',
                  fileType: 'png',
                  quality: 1, //图片质量
                  success(res2) {
                    // 调用uni.uploadFile上传图片即可
                    console.log(res2)
  
                    that.signSrc = res2.tempFilePath 
                    that.$emit("getImgBase64preview",res2.tempFilePath)
                    that.clear()
                  }
                },that)
              },200)

    },
   }
```