<template>
  <div>
    <button @click="getItems">Get MusicQue</button>
    <div v-for="(music, index) in musicques" :key="music.id"> 
      <iframe v-if="index===0" width="500px" height="345" :src="music.url"  allow="autoplay"  frameborder="0" allowfullscreen></iframe>     
      <div v-else class="queue-item" >
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

export default {
  name: 'GetItems',
  
  data() {
    return {
      musicques: [],
      errorMsg: '',
    }
  },
  methods: {
    getId(url) {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const match = url.match(regExp);

      return (match && match[2].length === 11)
        ? match[2]
        : null;
  },
    getItems() {
      // dummy data to test
      this.musicques = [
        {
          id: 1,
          title: 1,
          thumbnailUrl: "https://dummyimage.com/300",
          url: "https://www.youtube.com/watch?v=R43xOUlRHWc"
        },
        {
          id: 2,
          title: 2,
          thumbnailUrl: "https://dummyimage.com/302",
          url: "https://www.youtube.com/watch?v=R43xOUlRHWc"
        },
        {
          id: 3,
          title: 3,
          thumbnailUrl: "https://dummyimage.com/303",
          url: "https://www.youtube.com/watch?v=R43xOUlRHWc"
        },
        {
          id: 4,
          title: 4,
          thumbnailUrl: "https://dummyimage.com/304",
          url: "https://www.youtube.com/watch?v=R43xOUlRHWc"
        },
        {
          id: 5,
          title: 5,
          thumbnailUrl: "https://dummyimage.com/305",
          url: "https://www.youtube.com/watch?v=R43xOUlRHWc"
        }
      ].map((music ) => ({
        ...music,
        url: `https://www.youtube.com/embed/${this.getId(music.url)}?autoplay=1`
      }))


      axios
        .get(process.env.VUE_APP_API_ENDPOINT)
        .then((response) => {
          console.log(response)
          // uncommend this line to see the data
          // this.musicques = response.data
        })
        .catch((error) => {
          console.log(error)
          this.errorMsg = 'Error retrieving data'
        })
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
</style>