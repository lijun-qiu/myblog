---
title: 高德地图库使用demo
date: 2023-04-24
tags:
 - Amap
categories:
 - Amap
---
# 高德地图demo
第一步先创建高德账号，创建应用获取key和密匙，自行百度。

## npm安装
```js
 npm i @amap/amap-jsapi-loader --save
```

## 引入插件使用
```js
<template>
   <div class="page">
    <div class="icon"><img src="../assets/logo.png" alt=""></div>
    <div id="container"></div>
   </div>
   <button @click="showNowPosition">确定</button>
</template>

<script>
import { onMounted,reactive } from 'vue'
import AMapLoader from "@amap/amap-jsapi-loader";
import coordtransform from 'coordtransform';
export default {
  name: 'HelloW',
  setup(){

    let nowPosiotion = []
    function getCurrentPosition(){
      if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(showPosition, showError);
      } else {
          alert("Geolocation is not supported by this browser.");
      }

      function showPosition(position) {
          let latitude = position.coords.latitude;
          let longitude = position.coords.longitude;
          // 在这里处理获取到的位置信息
          // 转高德经纬度,当前就是高德经纬度
          // nowPosiotion = coordtransform.wgs84togcj02(longitude,latitude);
          nowPosiotion = [longitude,latitude]
          console.log(nowPosiotion)
      }

      function showError(error) {
          switch(error.code) {
              case error.PERMISSION_DENIED:
                  alert("User denied the request for Geolocation. please open");
                  break;
              case error.POSITION_UNAVAILABLE:
                  alert("Location information is unavailable.");
                  break;
              case error.TIMEOUT:
                  alert("The request to get user location timed out.");
                  break;
              case error.UNKNOWN_ERROR:
                  alert("An unknown error occurred.");
                  break;
          }
      }
    }

    //存储map对象
    let map
    //存储地址对象
    let geocoder
    //储存天气对象
    let weather

    //存储标点信息
    const state = reactive({
        path: [],
        current_position: [],
    });
    
    //进行地图初始化
    function initMap() {
      AMapLoader.load({
        key: "你的key值", // 申请好的Web端开发者Key，首次调用 load 时必填
        version: "2.0", // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
      })
      .then((AMap) => {
        map = new AMap.Map("container", {
          //设置地图容器id
          viewMode: "3D", //是否为3D地图模式
          pitch:65,//地图仰视角
          zoom: 10, //初始化地图级别
          center: nowPosiotion?nowPosiotion:[121.4737021, 31.2303904], //初始化地图中心点位置,谷歌有可能获取不到当前位置，需要设置https
        });
        //添加插件
        AMap.plugin(["AMap.ToolBar", "AMap.Scale", "AMap.HawkEye",'AMap.Geocoder','AMap.Weather'], function () {
          //异步同时加载多个插件
          map.addControl(new AMap.HawkEye()); //显示缩略图
          map.addControl(new AMap.Scale()); //显示当前地图中心的比例尺
          //逆编码实例
        })
    
        geocoder = new AMap.Geocoder({
            city: '010'
          });
        // 创建一个 Marker当前位置实例：
        let marker = new AMap.Marker({
            // position: new AMap.LngLat(121.4737021, 31.2303904),   // 经纬度对象，也可以是经纬度构成的一维数组[116.39, 39.9]
            position:nowPosiotion,
            title: '当前位置'
        });

        weather = new AMap.Weather();

        //将创建的点标记添加到已有的地图实例：
        map.add(marker);

        // 单击事件
        map.on("click", (e) => {
          console.log(e);
          // state.current_position = [e.lnglat.KL, e.lnglat.kT];
          // state.path.push([e.lnglat.KL, e.lnglat.kT]);
          // console.log(state)
          // addMarker();
          // addPolyLine();
          // 地图按照适合展示图层内数据的缩放等级展示
          // map.setFitView();
        });
        //移动结束事件
        map.on('moveend',(e)=>{
          // console.log(map.getCenter().toString())
        })

        //地图缩放改变事件
        map.on('zoomchange', (e)=>{
          //设置中心点
          // map.setCenter(nowPosiotion);
        });
        // 实例化点标记
        function addMarker() {
          const marker = new AMap.Marker({
            icon: "//a.amap.com/jsapi_demos/static/demo-center/icons/poi-marker-default.png",
            position: state.current_position,
            offset: new AMap.Pixel(-26, -54),
          });
          map.add(marker)
        }

      // 折线
      function addPolyLine() {
        const polyline = new AMap.Polyline({
          path: state.path,
          isOutline: true,
          outlineColor: "#ffeeff",
          borderWeight: 1,
          strokeColor: "#3366FF",
          strokeOpacity: 0.6,
          strokeWeight: 5,
          // 折线样式还支持 'dashed'
          strokeStyle: "solid",
          // strokeStyle是dashed时有效
          // strokeDasharray: [10, 5],
          lineJoin: "round",
          lineCap: "round",
          zIndex: 50,
        });
        map.add([polyline]);
      }
      }).catch((e) => {
            console.log(e);
        });
    }

    onMounted(()=>{
      getCurrentPosition()
      initMap();
    })

    function showNowPosition(){
      let lnglat = [map?.getCenter()?.KL,map?.getCenter()?.kT]//这里是需要转化的经纬度
      // console.log(lnglat,geocoder.getAddress)
      geocoder.getAddress(lnglat?lnglat:[], function(status, result) {
        console.log(status,result)
        if (status === 'complete' && result.regeocode) {
          console.log(result.regeocode.formattedAddress);
          //根据位置获取天气
          weather.getLive(result.regeocode.addressComponent.district, function(err, data) {
            console.log(data);
          });
        } else {
          console.log('根据经纬度查询地址失败');
        }
      })
    }
    return{
      showNowPosition
    }
  }
}
</script>

<style scoped>
#container {width:1200px; height: 610px; }  

/deep/ .amap-icon img{
  position: relative;
}
.page{
  position: relative;
  width:1200px; height: 610px;
}
.icon{
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%,-50%);
  z-index: 2000;
  width: 30px;
  height: 30px;
}
.icon > img{
    width: 30px;
    height: 30px;
    position: relative;
    top: -20px;
}
</style>
```
<b>注意:模板中只引入了可以，获取位置时请求不到，因为还要密匙，可以在index.html模板中引入</b>
```js
   <script type="text/javascript">
      window._AMapSecurityConfig = {
      securityJsCode:'你的密匙',
      }
    </script>
```
<b>另外，获取本地位置的api：navigator.geolocation.getCurrentPosition在谷歌地图中可能会走谷歌引擎，获取不到，需要设置https请求，目前edag和火狐是没有问题的。</b>
