<template>
  <div>
    <div>
        <div id="logo">
          <img :src="'./logo.png'" />
        </div>
    </div>
    <h2>Hi, I Am MUSICQUE</h2>
    <hr />  
    
    <GetItems class="form-section" />
  </div>
</template>

<script>

import GetItems from './components/GetItems'

export default {
  name: 'App',
  components: {
    GetItems,    
  },
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

#logo {
    display: flex;
    width: 15%;
    flex-direction: column;
    justify-content: center;
    margin: auto;
}

.form-section {
  display: block;
  margin: 2%;
  justify-content: left;
}

.error {
  color: red;
}

div {
  margin: 1%;
}
input {
  margin: 1%;
}
label {
  margin: 1%;
}

</style>
