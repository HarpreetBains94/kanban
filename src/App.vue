<template>
  <v-app>
    <v-app-bar
      app
      color="primary"
      dark
    >
      <v-container>
        <img class="navbar-image" contain :src="require('@/assets/Logo-white.svg')" />
      </v-container>
    </v-app-bar>

    <v-main>
      <KanbanComponent/>
    </v-main>
  </v-app>
</template>

<script lang="ts">
import {
  Component,
  Provide,
  Vue,
} from 'vue-property-decorator';
import KanbanComponent from '@/components/KanbanComponent.vue';
import {
  DataService,
  DATA_SERVICE_SYMBOL,
} from '@/services/DataService';

@Component({
  components: {
    KanbanComponent,
  }
})
export default class App extends Vue {
  @Provide(DATA_SERVICE_SYMBOL) private dataService: DataService = new DataService();
}
</script>
<style lang="scss">
.navbar-image {
  height: 45px;
}
</style>