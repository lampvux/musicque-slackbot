<template>
  <div>
    <button @click="getItems">Get MusicQue</button>
    <VueVideoPlayer  :options="playerOptions" ref="videoPlayer" s3PublicUrl="currentPlay.s3PublicUrl" onEnded="videoEnded" ></VueVideoPlayer>
    <div v-for="(music, index) in musicques" :key="music.id"> 
      <div v-if="index !== 0" class="queue-item" >
        <a :href="music.url" >
          <img :src="music.thumbnailUrl" />
        </a>
        <h3>{{ music.title }}</h3>
      </div>
    </div>
    <h3 class="error" v-if="errorMsg">{{ errorMsg }}</h3>
  </div>
</template>

<script>
import axios from 'axios'
import VueVideoPlayer from './VueVideoPlayer.vue'

export default {
  name: 'GetItems',
  components: {
    VueVideoPlayer,
  },
  data() {
    return {
      musicques: [],
      errorMsg: '',
      currentPlay: null,
     
    }
  },
  methods: {
    
    getItems() {
     
      axios
        .get(process.env.VUE_APP_API_ENDPOINT)
        .then((response) => {
          console.log(response)
          // uncommend this line to see the data
          this.musicques = response.data
          if (this.musicques.length && !this.currentPlay)
            this.currentPlay = this.musicques[0];
        })
        .catch((error) => {
          console.log(error)
          this.errorMsg = 'Error retrieving data'
        })
    },
    videoEnded() {
     
      // send the delete request to the API
      axios
        .delete(`${process.env.VUE_APP_API_ENDPOINT}/${this.musicques[0].id}`)
        .then((response) => {
          console.log(response)
        })
        .catch((error) => {
          console.log(error)
        })
      // remove the first item from the array & set the current play
      this.currentPlay = this.musicques.shift()
    },
  },
  // on mounted, call the getItems method
  mounted() {    
    // set interval to call getItems every 5 seconds    
    setInterval(() => {
      this.getItems()
    }, 5000)
  },
}
</script>

<style scoped>
.queue-item {
  display: flex;
  align-items: center;
  justify-content: center;
}
.queue-item img {
  width: 100px;
  height: 100px;
  margin: 10px;
}
.queue-item h3 {
  margin: 10px;
}
</style>