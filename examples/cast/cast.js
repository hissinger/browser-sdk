/* global Remon */
/* eslint-disable no-console */

let roomName = "";
let bored = true;
const initButton1 = document.querySelector("#initButton1");
const closeButton = document.querySelector('#exitButton');
const localVideoElement1 = document.querySelector('#localVideo1');
const remoteVideoElement1 = document.querySelector('#remoteVideo1');
const channelIdInputElement1 = document.querySelector('#channelIdInput1');
const logElement = document.querySelector('#log');
let appTitleElement = document.querySelector('#appTitle');
const createButton = document.querySelector('#createButton');
var isInitStatusCalled =false;
var isOnDisplayUserMediaCalled = false;
var isPresenter = true;
var r0;
var r1;
var vList=[];
var latestV;
var remoteTotalCount = 0;
const serviceId = 'SERVICEID1';
const serviceKey = '1234567890';
var wsurl1= 'wss://remotemonster.com/ws';
var resturl1= 'https://remotemonster.com/rest';

const rtcConfig1 = {
  credential: {
    key: serviceKey,
    serviceId: serviceId,
    wsurl: wsurl1,
    resturl: resturl1,
  },
  view: {
    local: '#localVideo1',
    remote: '#remoteVideo1'
  },
  media:{
    audio: true,
    video: {
      width: {max: '320', min: '320'},
      height: {max: '240', min: '240'},
      //codec: 'H264',
      frameRate: 15,
    },
    sendonly: true,
  },
  dev: {
    logLevel: 'DEBUG',
  },
};

var rtcListener = {
  onInit(token) {
    l(`EVENT FIRED : onInit: ${token}`);
  },
  onCreateChannel(channelId) {
    l(`EVENT FIRED : onCreateChannel: ${channelId}`);
    appTitleElement.innerHTML = roomName+" - "+ "Waiting";
  },
  onConnectChannel(channelId) {
    l(`EVENT FIRED : onConnectChannel ${channelId}`);
    appTitleElement.innerHTML = roomName+" - "+ "Joining";
  },
  onComplete() {
    l('EVENT FIRED : onComplete');
    appTitleElement.innerHTML = roomName+" - "+ "Join completed";
  },
  onAddLocalStream(stream) {
    l(`EVENT FIRED : onAddLocalStream: ${stream}`);
  },
  onStateChange(state) {
    l(`EVENT FIRED : onStateChange: ${state}`);
    if (state == 'CLOSE'){
      if (!bored)toggleButton();
    }else if(state == 'FAIL'){
      if (!bored)toggleButton();
    }else if (state == 'INIT'){
      isInitStatusCalled = true;
      if (!isPresenter){
        latestV.joinRoom(roomName);
      }
    }else if (state =='LOCALMEDIA'){
      if (isPresenter){
        latestV.createRoom(roomName);
      }
    }
  },
  onDisconnectChannel(msg) {
    l('EVENT FIRED : onDisconnectChannel from '+msg);
    if (msg!=='room')return;
    if (!bored)toggleButton();
  },
  onError(error) {
    l(`EVENT FIRED : onError: ${error}`);
    l(error);
    if (!bored)toggleButton();
  },
  onMessage(msg){
    l('MSG: '+ msg);
  },
  onDisplayUserMedia(stream) {
    l('event fired: onDisplayUserMedia');
  },
  onStat(result){
    const stat = "State: l.cand:"+result.localCandidate+"/r.cand:"+result.remoteCandidate+"/l.res:"+result.localFrameWidth+" "+result.localFrameHeight+"/r.res:"+result.remoteFrameWidth+" "+result.remoteFrameHeight+"/l.rate:"+result.localFrameRate + "/r.rate:"+result.remoteFrameRate+"/s.BW:"+ result.availableSendBandwidth + "/r.BW"+ result.availableReceiveBandwidth + "/rtt:" + result.rtt + "/l.AFL:" + result.localAudioFractionLost + "/l.VFL:"+ result.localVideoFractionLost + "/r.AFL" + result.remoteAudioFractionLost + "/r.VFL" + result.remoteVideoFractionLost +"<br>";
    //l(stat);
  },
  onSearch(result){
    document.querySelector('#log').innerHTML += result;
  }
};

closeButton.addEventListener('click', (event) => {
  console.log('[App] Try to disconnect.');
  closeRemons();
  event.preventDefault();
}, false);
function closeRemons(){
  latestV=null;
  for (var v in vList){
    vList[v].close();
  }
  if (!bored)toggleButton();
}
createButton.addEventListener('click', (event) =>{
  isPresenter = true;
  roomName = document.querySelector('#channelIdInput1').value;
  if (!document.querySelector('#useVideo1').checked){
    rtcConfig1.media.video = false;
  }else{
    rtcConfig1.media.video.width.max = document.querySelector('#width1').value;
    rtcConfig1.media.video.width.min = document.querySelector('#width1').value;
    rtcConfig1.media.video.height.max = document.querySelector('#height1').value;
    rtcConfig1.media.video.height.min = document.querySelector('#height1').value;
    rtcConfig1.media.video.codec = document.querySelector('#videoCodec1').value;
    rtcConfig1.media.video.frameRate.max = document.querySelector('#frameRate1').value;
    rtcConfig1.media.video.frameRate.min = document.querySelector('#frameRate1').value;
  }

  l("config:"+JSON.stringify(rtcConfig1));
  latestV = new Remon({config: rtcConfig1, listener: rtcListener});
  vList.push(latestV);
  toggleButton();
  event.preventDefault();
}, false);

function connectRoom(rName){
  isPresenter = false;
  roomName = rName;
  document.querySelector('#localViewDiv').style.display='none';
  remoteTotalCount = remoteTotalCount + 1;
  createRemoteDiv(remoteTotalCount);
  var rtcConfigForViewer ={
    credential: {
      key: serviceKey,
      serviceId: serviceId,
    wsurl: wsurl1,
    resturl: resturl1,
    },
    view: {
      remote: '#remoteVideo'+remoteTotalCount
    },
    media:{
      audio: true,video: false,recvonly: true,roomid:roomName
    },
    dev: {
      logLevel: 'DEBUG',
    },
  };
  latestV = new Remon({config: rtcConfigForViewer, listener: rtcListener});
  vList.push(latestV);
  toggleButton();
}

function createRemoteDiv(currentCount){
  var videoTag = document.createElement("video")
  videoTag.id="remoteVideo"+currentCount;
  videoTag.autoplay="autoplay";
  videoTag.controls="controls";
  var videoDiv = document.createElement("div");
  videoDiv.classname="mdl-card__media video-container";
  videoDiv.appendChild(videoTag);
  var h2Div = document.createElement("h2");
  h2Div.className="mdl-card__title-text";
  h2Div.innerHTML= "remote" + currentCount;
  var titleDiv = document.createElement("div");
  titleDiv.className="mdl-card__title";
  titleDiv.appendChild(h2Div);
  var motherDiv = document.createElement("div");
  motherDiv.className = "square-card mdl-card mdl-shadow--2dp";
  motherDiv.appendChild(titleDiv);
  motherDiv.appendChild(videoDiv);
  var mainDiv = document.querySelector('#mainDiv');
  mainDiv.appendChild(motherDiv);
}

function toggleButton(){
  if (bored){
    document.querySelector("#createButton").style.visibility="hidden";
    document.querySelector("#createButton").style.display="none";
    document.querySelector("#exitButton").style.visibility="visible";
    document.querySelector("#exitButton").style.display="block";
  }else{
    document.querySelector("#createButton").style.visibility="visible";
    document.querySelector("#createButton").style.display="block";
    document.querySelector("#exitButton").style.visibility="hidden";
    document.querySelector("#exitButton").style.display="none";
  }
  bored = !bored;
}


// remon object for just only search
const rtcConfig0 = {
  credential: {
    key: serviceKey,
    serviceId: serviceId,
    wsurl: wsurl1,
    resturl: resturl1,
  },
  media: {
    audio:true,
    video:false,
    broadcast:true
  },
  dev: {
    logLevel: 'DEBUG',
  },
};

function searchPoller(){
  //if (bored)
  r0.liveRooms().then(result =>{
    var search_list = document.querySelector('#search_list');
    search_list.innerHTML = '';
    Object.keys(result).forEach( (roomKey) => {
      console.log(result[roomKey].id);
      var resultRoomName = result[roomKey].id;
      search_list.innerHTML += "<div class='mdl-list__item' style='float:left;'>";
      search_list.innerHTML += "<span class='mdl-list__item-primary-content'>";
      search_list.innerHTML += "&nbsp;&nbsp;<span><button class='mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--accent' onclick='connectRoom(\""+resultRoomName+"\")'><i class='material-icons mdl-list__item-icon'>person</i>&nbsp;- "+result[roomKey].hostname+"</button></span>";
      search_list.innerHTML += "</span></div>";
    });
  });
}
function l(msg){
    logElement.innerHTML = msg+"<br>"+logElement.innerHTML;
}
const rtcListener0 = {
  onInit(token) {
    searchPoller();
    setInterval(searchPoller,5000);
  },
  onSearch(result){
    console.log(result);
    var resultObj = JSON.parse(result);
    var search_list = document.querySelector('#search_list');
    search_list.innerHTML = "";
    for( var ch_i=0;ch_i<resultObj.length; ch_i++){
      //if (resultObj[ch_i].status==="WAIT" && roomName.trim() != resultObj[ch_i].id.trim()){
      
        var resultRoomName = resultObj[ch_i].id;
        
        search_list.innerHTML += "<div class='mdl-list__item' style='float:left;'>";
        search_list.innerHTML += "<span class='mdl-list__item-primary-content'>";
        search_list.innerHTML += "&nbsp;&nbsp;<span><button class='mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--accent' onclick='connectRoom(\""+resultRoomName+"\")'><i class='material-icons mdl-list__item-icon'>person</i>&nbsp;- "+resultRoomName+"</button></span>";
        search_list.innerHTML += "</span></div>";
      
    }

  }
};
r0 = new Remon({config: rtcConfig0, listener: rtcListener0});
