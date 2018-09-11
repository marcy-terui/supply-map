<template>
  <div id="app">
    <v-app>
      <v-content>
        <v-navigation-drawer
          fixed
          v-model="leftDrawer"
        >
          <v-toolbar flat>
            <v-list>
              <v-list-tile>
                <v-list-tile-title>
                  Search
                </v-list-tile-title>
              </v-list-tile>
            </v-list>
            <v-toolbar-side-icon @click.stop="leftDrawer = !leftDrawer"></v-toolbar-side-icon>
          </v-toolbar>
          <v-divider></v-divider>
          <v-list>
            <v-list-tile avatar>
              <v-list-tile-avatar>
                <v-icon color="primary">list</v-icon>
              </v-list-tile-avatar>
              <v-list-tile-content>
                <v-select
                  :items="collections"
                  label="カテゴリを選ぶ"
                  v-model="collection"
                ></v-select>
              </v-list-tile-content>
            </v-list-tile>
            <v-list-tile avatar>
              <v-list-tile-avatar>
                <v-icon color="primary">find_replace</v-icon>
              </v-list-tile-avatar>
              <v-list-tile-content>
                <v-text-field
                  label="地名を入力"
                  v-model="searchText"
                ></v-text-field>
              </v-list-tile-content>
            </v-list-tile>
            <v-list-tile avatar @click="search">
              <v-list-tile-avatar>
                <v-icon color="primary">pin_drop</v-icon>
              </v-list-tile-avatar>
              <v-list-tile-content>
                <v-list-tile-title>移動する</v-list-tile-title>
              </v-list-tile-content>
            </v-list-tile>
            <v-list-tile avatar @click="current">
              <v-list-tile-avatar>
                <v-icon color="primary">my_location</v-icon>
              </v-list-tile-avatar>
              <v-list-tile-content>
                <v-list-tile-title>現在地へ移動する</v-list-tile-title>
              </v-list-tile-content>
            </v-list-tile>
          </v-list>
        </v-navigation-drawer>
        <v-layout row wrap>
          <v-flex
            xs12
            sm12
            md12
          >
            <v-card color="grey lighten-4" flat>
              <v-toolbar color="primary" dark dense>
                <v-btn
                  icon
                  fab
                  @click.stop="leftDrawer = !leftDrawer"
                >
                  <v-icon>search</v-icon>
                </v-btn>
                <v-toolbar-title>{{title}}</v-toolbar-title>
                <v-spacer></v-spacer>
                <v-btn
                  icon
                  fab
                  @click.stop="rightDrawer = !rightDrawer"
                >
                  <v-icon>help</v-icon>
                </v-btn>
              </v-toolbar>
            </v-card>
          </v-flex>
          <v-flex
            xs12
            sm12
            md12
          >
            <v-card color="grey lighten-4" flat>
              <v-toolbar dense>
                <v-toolbar-title class="body-2">{{userMessage}}</v-toolbar-title>
                <v-spacer></v-spacer>
                <v-btn
                  round
                  color="primary"
                  @click="auth"
                >
                  Login with Google
                </v-btn>
              </v-toolbar>
            </v-card>
          </v-flex>
        </v-layout>

        <v-navigation-drawer
          fixed
          right
          v-model="rightDrawer"
        >
          <v-toolbar flat>
            <v-list>
              <v-list-tile>
                <v-list-tile-title>
                  Help
                </v-list-tile-title>
              </v-list-tile>
            </v-list>
            <v-toolbar-side-icon @click.stop="rightDrawer = !rightDrawer"></v-toolbar-side-icon>
          </v-toolbar>
          <v-divider></v-divider>
          <v-list>
            <template v-for="(item, i) in sideItems">
              <v-list-tile
                :key="i"
                avatar
                @click="item.dialog = true"
              >
                <v-list-tile-avatar>
                  <v-icon color="primary">{{ item.icon }}</v-icon>
                </v-list-tile-avatar>
                <v-list-tile-content>
                  <v-list-tile-title>{{ item.title }}</v-list-tile-title>
                </v-list-tile-content>
                <v-dialog :key="'n' + i" v-model="item.dialog" fullscreen hide-overlay transition="dialog-bottom-transition">
                  <v-card>
                    <v-toolbar dark color="primary">
                      <v-btn icon dark @click.native="item.dialog = false">
                        <v-icon>close</v-icon>
                      </v-btn>
                      <v-toolbar-title>{{item.title}}</v-toolbar-title>
                    </v-toolbar>
                    <v-list dense three-line>
                      <template v-for="(d,i) in item.descriptions">
                        <v-list-tile :key="i">
                          <v-list-tile-content>
                            {{d}}
                          </v-list-tile-content>
                        </v-list-tile>
                        <v-divider :key="'d' + i"></v-divider>
                      </template>
                    </v-list>
                  </v-card>
                </v-dialog>
              </v-list-tile>
            </template>
          </v-list>
        </v-navigation-drawer>
        <v-container>
          <v-alert
            v-model="alert"
            dismissible
            :color="alertType"
            transition="scale-transition"
          >
            {{alertMessage}}
          </v-alert>
        </v-container>
        <v-container>
          <v-card>
            <GmapMap ref="mapRef"
                     id="map"
                     :center="center"
                     :zoom="15"
                     @click="addMarker"
                     @center_changed="loadMarkers"
                     @bounds_changed="loadMarkers">
              <GmapInfoWindow :options="infoOptions"
                               :position="infoWindowPos"
                               :opened="infoWinOpen"
                               @closeclick="infoWinOpen=false">
                <v-card>
                  <v-list subheader>
                    <v-subheader>コメント</v-subheader>
                    <v-list-tile
                      v-for="(c,i) in commentInfos"
                      :key="i"
                      avatar
                      :color="c.color"
                    >
                      <v-list-tile-avatar>
                        <v-icon :color="c.color">{{c.icon}}</v-icon>
                      </v-list-tile-avatar>
                      <v-list-tile-content>
                        <v-list-tile-title>{{c.comment}}</v-list-tile-title>
                        <v-list-tile-sub-title>{{c.datetime}}</v-list-tile-sub-title>
                      </v-list-tile-content>
                    </v-list-tile>
                  </v-list>
                </v-card>
                <div class="text-xs-center">
                  <v-btn fab small color="primary" @click="addCommentToMarker(infoWindowPos)">
                    <v-icon dark>add</v-icon>
                  </v-btn>
                </div>
              </GmapInfoWindow>

              <GmapMarker :key="i"
                          v-for="(m,i) in markers"
                          :position="m.position"
                          :clickable="true"
                          :icon="m.icon"
                          @click="toggleInfoWindow(m,i)">
              </GmapMarker>
            </GmapMap>

            <v-dialog v-model="dialog" persistent max-width="500px">
              <v-card>
                <v-card-title>
                  <span class="headline">状況を報告する</span>
                </v-card-title>
                <v-card-text>
                  <v-container grid-list-md>
                    <v-layout wrap>
                      <v-flex xs12>
                        <v-radio-group v-model="markerForm.statusSelected" :mandatory="false">
                          <v-radio v-for="(s,i) in markerForm.statusOptions"
                                  :key="i"
                                  :color="s.color"
                                  :label="s.text"
                                  :value="s.value">
                          </v-radio>
                        </v-radio-group>
                      </v-flex>
                      <v-flex xs12>
                        <v-text-field v-model="markerForm.comment" label="コメントを入力してください" type="text" required></v-text-field>
                      </v-flex>
                    </v-layout>
                  </v-container>
                </v-card-text>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn color="blue darken-1" flat @click.native="dialog = false">Close</v-btn>
                  <v-btn color="blue darken-1" flat @click.native="dialog = false;report()">Save</v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
          </v-card>
        </v-container>
        <v-card color="grey lighten-4" flat>
          <v-tabs
            color="primary"
            dark
            slider-color="yellow"
          >
            <v-tab>
              お知らせ・更新情報
            </v-tab>
            <v-tab-item>
              <template v-for="(news,i) in newsItems">
                <v-card :key="i" flat>{{news}}</v-card>
                <v-divider :key="'d' + i"></v-divider>
              </template>
            </v-tab-item>
            <v-tab>
              お問い合わせ・ご要望
            </v-tab>
            <v-tab-item>
              <v-card flat>ご質問やご要望は下記管理者連絡先までご連絡ください。</v-card>
              <v-divider></v-divider>
              <v-card flat>Twitter: <a target="_blank" href="https://twitter.com/marcy_terui">@marcy_terui</a></v-card>
              <v-card flat>E-mail: <a target="_blank" href="mailto:supply-map@willy.works">supply-map@willy.works</a></v-card>
              <v-card flat>GitHub: <a target="_blank" href="https://github.com/marcy-terui/supply-map">marcy-terui/supply-map</a></v-card>
            </v-tab-item>
          </v-tabs>
        </v-card>
      </v-content>
    </v-app>
  </div>
</template>

<script>
import dateformat from 'dateformat'
import geoService from './services/geoService'
import firebaseService from './services/firebaseService'
import {gmapApi} from 'vue2-google-maps'

const DEFAULT_MARKER_FORM = {
  comment: '',
  statusSelected: 'good',
  statusOptions: [
    { text: '良好○', value: 'good', color: 'success' },
    { text: '注意△', value: 'warn', color: 'warning' },
    { text: '不可✕', value: 'ng', color: 'error' }
  ],
  statusIcons: {
    'good': 'panorama_fish_eye',
    'warn': 'warning',
    'ng': 'clear'
  },
  statusColors: {
    'good': 'success',
    'warn': 'warning',
    'ng': 'error'
  },
  markerColors: {
    'good': '#008000',
    'warn': '#ffff00',
    'ng': '#ff0000'
  }
}

export default {
  name: 'app',
  data () {
    return {
      title: '災害復旧・供給状況マップ (β)',
      sideItems: [{
        icon: 'info',
        title: '使い方・注意事項',
        descriptions: [
          '最初に現在地付近に移動します。位置情報の提供を許可してください。なかなか移動しない場合はリロードしてみてください。',
          '閲覧は誰にでもできます。いたずらの防止のため、念のため情報の登録はGoogleアカウントによるログイン(Login with Google)をお願いしています。',
          '虫眼鏡のアイコンをクリック(タップ)するとメニューが開きます。',
          '左メニューのセレクトボックスから知りたい情報を選択してください。 ',
          '現在マップ上の表示領域に存在する情報が自動的に検索されます。表示領域を変えても自動的に追従します。',
          '情報には３種類のステータスを設けています。マーカーの色が緑「良好」、黄色「注意」、赤色「不可」です。登録時はどれかを選んでください。',
          '左メニューのテキストボックスに検索したい地名を入力して「移動する」ボタンをクリック(タップ)するとその場所を検索します。',
          '「現在地げ移動する」ボタンをクリック(タップ)すると現在地を検索します。',
          'ログイン状態で地図上をクリック(タップ)すると新しい情報の登録ができます。',
          '既に情報が存在する地点のマーカーを選択すると詳しい情報が閲覧できます。',
          '既に情報が存在する地点に新しい情報を追加する場合は「+」ボタンを押してください。',
          '何かご不明な点や不具合のようなものを見つけた場合は管理者までご連絡ください。'
        ],
        dialog: false
      },
      {
        icon: 'question_answer',
        title: 'よくあるご質問',
        descriptions: [
          'Q. 使い方が分かりません。 A. 「使い方・注意事項」のメニューをご確認いただき、分からなければ管理者（サイト下部に記載）にお気軽にお声がけください。',
          'Q. 使いづらい。 A. 是非、開発者（サイト下部に記載）にフィードバックしてあげてください！',
          'Q. ほしい情報のカテゴリがありません。 A. 新しいカテゴリの追加は簡単にできますので遠慮なく管理者までご依頼ください。',
          'Q. 開発に参加できますか？ A. 是非お願いします！開発者（サイト下部に記載）にまでご連絡ください！',
          'Q. このサイトを宣伝しても良いですか？ A. はい。是非お願いします。',
          'Q. このサイトは誰によって運営されていますか？ A. 個人によって運営されています。サイト下部のお問い合わせ情報を参照してください。',
          'Q. このサイトは安全ですか？ A. はい。セキュリティには気を使って開発しています。',
          'Q. 個人情報の管理はどうなっていますか？ A. このサイトでは一切の個人情報と認証情報を持たず、サーバも持たず、Googleのサービスとの連携のみによって全て機能が実現されています。',
          'Q. このサイトは具体的に何のサービスで作られていますか？ A. Google Maps Javascript API, Firebase, Firestoreになります。',
          'Q. このサイトは具体的に何のフレームワークで作られていますか？ A. Vue.js, Vuetify。いわゆる2-TierなサーバーレスSPAです。'
        ],
        dialog: false
      }],
      newsItems: [
        '2018-09-11 00:00 - デザインを抜本的に見直しました。サイトの使い方は左上のメニューボタンからご確認いただけます。',
        '2018-09-10 01:20 - 地名検索ボックスを追加しました。空の場合は現在地を検索します。',
        '2018-09-09 23:00 - 交通系のカテゴリを追加しました。',
        '2018-09-09 20:20 - 生鮮食品：乳製品のカテゴリを追加しました。',
        '2018-09-09 17:45 - 公開しました！'
      ],
      dialog: false,
      leftDrawer: false,
      rightDrawer: false,
      center: {
        lat: 43.061049,
        lng: 141.356449
      },
      commentInfos: [],
      infoWindowPos: null,
      infoWinOpen: false,
      currentMidx: null,
      infoOptions: {
        pixelOffset: {
          width: 0,
          height: 0
        }
      },
      markers: [],
      markerForm: DEFAULT_MARKER_FORM,
      collection: 'electric_power',
      collections: [
        { value: 'electric_power', text: '電気' },
        { value: 'water', text: '水道' },
        { value: 'gas', text: 'ガス' },
        { value: 'gasoline', text: 'ガソリン' },
        { value: 'drinks', text: '飲料類' },
        { value: 'preserved_foods', text: '保存食類' },
        { value: 'prepared_foods', text: '弁当・惣菜' },
        { value: 'meats', text: '生鮮食品：肉類' },
        { value: 'seafoods', text: '生鮮食品：魚介類' },
        { value: 'vegetables', text: '生鮮食品：野菜類' },
        { value: 'milk', text: '生鮮食品：乳製品' },
        { value: 'transportation', text: '交通：公共交通機関' },
        { value: 'roads', text: '交通：道路状況' }
      ],
      userMessage: '情報の登録のためにはログインが必要です',
      searchText: '',
      alert: true,
      alertType: 'info',
      alertMessage: '使い方は右の？マークのメニューからご確認いただけます。'
    }
  },
  methods: {
    toggleInfoWindow (marker, idx) {
      this.infoWindowPos = marker.position
      this.commentInfos = marker.commentInfos
      if (this.currentMidx === idx) {
        this.infoWinOpen = !this.infoWinOpen
      } else {
        this.infoWinOpen = true
        this.currentMidx = idx
      }
    },
    auth () {
      firebaseService.auth()
    },
    getCurrentUserName () {
      const user = firebaseService.getCurrentUser()
      if (user != null) {
        if ('displayName' in user) {
          return user.displayName
        }
      } else {
        return null
      }
    },
    search () {
      if (this.searchText !== '') {
        geoService.searchAddress(
          this.google,
          this.$refs.mapRef.$mapObject,
          this.searchText
        ).then((marker) => {
          marker.addListener('click', (e) => {
            this.clickedPosition = {
              lat: e.latLng.lat(),
              lng: e.latLng.lng()
            }
            this.markerForm = DEFAULT_MARKER_FORM
            this.dialog = true
          })
        })
      }
    },
    current () {
      geoService.currentAddress(
        this.google,
        this.$refs.mapRef.$mapObject
      ).then((marker) => {
        marker.addListener('click', (e) => {
          this.clickedPosition = {
            lat: e.latLng.lat(),
            lng: e.latLng.lng()
          }
          this.markerForm = DEFAULT_MARKER_FORM
          this.dialog = true
        })
      })
    },
    report () {
      firebaseService.addReport(
        this.collection,
        this.clickedPosition.lat,
        this.clickedPosition.lng,
        this.markerForm.comment,
        this.markerForm.statusSelected
      ).then((msg) => {
        this.loadMarkers()
        this.alertSuccess(msg)
      }).catch((msg) => {
        this.alertError('登録に失敗しました。ログインしていない場合はログインをお願いします。')
      })
    },
    alertSuccess (msg) {
      this.alert = true
      this.alertType = 'success'
      this.alertMessage = msg
    },
    alertError (msg) {
      this.alert = true
      this.alertType = 'error'
      this.alertMessage = msg
    },
    loadMarkers () {
      this.markers = []
      const bounds = this.$refs.mapRef.$mapObject.getBounds()
      const swLatlng = bounds.getSouthWest()
      const neLatlng = bounds.getNorthEast()
      firebaseService.queryReports(
        this.collection,
        swLatlng.lat(),
        swLatlng.lng(),
        neLatlng.lat(),
        neLatlng.lng()
      ).then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          let data = doc.data()
          this.markers.push({
            position: {
              lat: data.position.latitude,
              lng: data.position.longitude
            },
            commentInfos: data.comments.map((c) => {
              let dt = dateformat(c.timestamp.toDate(), 'yyyy-mm-dd hh:MM:ss')
              return {
                status: c.status,
                comment: c.comment,
                datetime: dt,
                icon: this.markerForm.statusIcons[c.status],
                color: this.markerForm.statusColors[c.status]
              }
            }),
            icon: {
              url: require(`./assets/marker-${data.status}.svg`),
              fillColor: this.markerForm.markerColors[data.status]
            }
          })
        })
      })
    },
    addCommentToMarker (pos) {
      this.clickedPosition = pos
      this.markerForm = DEFAULT_MARKER_FORM
      this.dialog = true
    },
    addMarker (e) {
      this.clickedPosition = {
        lat: e.latLng.lat(),
        lng: e.latLng.lng()
      }
      this.markerForm = DEFAULT_MARKER_FORM
      this.dialog = true
    }
  },
  async mounted () {
    const position = await geoService.getCurrentPosition()
    const userName = this.getCurrentUserName()

    if (userName != null) {
      this.userMessage = `${userName} さん、ご協力ありがとうございます！`
    }

    this.$watch('collection', (val) => {
      this.loadMarkers()
    })

    this.center = {
      lat: position.coords.latitude,
      lng: position.coords.longitude
    }
  },
  computed: {
    google: gmapApi
  }
}
</script>

<style scoped lang="scss">
#map {
  position: relative;
  width: 100%;
  height: 600px;
  margin: 0;
  padding: 0
}
.title {
  font-size: medium
}
.toolbarItem {
  margin: 5px;
  width: auto;
}
</style>
