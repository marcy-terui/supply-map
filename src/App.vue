<template>
  <div id="app" class="container-fluid">
    <div class="row">
      <b-navbar class="navbar" toggleable="md" type="dark" variant="info">
        <b-navbar-brand class="navbarItem" href="#"><h1>災害時供給状況マップ（β）</h1></b-navbar-brand>
        <b-form-select class="navbarItem" v-model="collection" :options="collections" />
        <b-button class="navbarItem" @click="auth">Login with Google</b-button>
        <b-navbar-brand class="navbarItem" v-if="user" href="#">{{user}} さん、ご協力ありがとうございます。</b-navbar-brand>
      </b-navbar>
    </div>
    <gmap-map ref="mapRef"
              id="map"
              :center="center"
              :zoom="15">
      <gmap-info-window :options="infoOptions"
                        :position="infoWindowPos"
                        :opened="infoWinOpen"
                        @closeclick="infoWinOpen=false">
        <b-list-group>
          <b-list-group-item v-for="(c,i) in commentInfos" :key="i" :variant="c.color">
            {{c.status}} {{c.comment}} ({{c.datetime}})
          </b-list-group-item>
        </b-list-group>
        <b-button id="addCommentBtn" variant="primary" @click="addCommentToMarker(infoWindowPos)">追加</b-button>
      </gmap-info-window>

      <gmap-marker :key="i"
                   v-for="(m,i) in markers"
                   :position="m.position"
                   :clickable="true"
                   :icon="m.icon"
                   @click="toggleInfoWindow(m,i)">
      </gmap-marker>
    </gmap-map>

    <b-modal ref="markerModalRef" title="報告する" @ok="report()">
      <div class="d-block text-left">
        <b-form-group id="markerStatusGroup"
                      label="状況:"
                      label-for="markerStatus"
                      description="状況を選択してください">
          <b-form-select v-model="markerForm.statusSelected"
                         :options="markerForm.statusOptions"
                         class="mb-3" />
        </b-form-group>
        <b-form-group id="markerCommentGroup"
                      label="コメント:"
                      label-for="markerComment"
                      description="状況などを入力してください（ex. 「●●がたくさんあります」「▲▲が残り少ないです」「全くありません」）">
          <b-form-input id="markerComment"
                        type="text"
                        v-model="markerForm.comment"
                        required
                        placeholder="コメントを入力">
          </b-form-input>
        </b-form-group>
      </div>
    </b-modal>
    <div class="row">
      <b-tabs class="tabs">
        <b-tab title="お知らせ・更新情報" active>
          <b-list-group>
            <b-list-group-item>2018-09-09 23:00 - 交通系のカテゴリを追加しました</b-list-group-item>
            <b-list-group-item>2018-09-09 20:20 - 生鮮食品：乳製品のカテゴリを追加しました</b-list-group-item>
            <b-list-group-item>2018-09-09 17:45 - 公開しました！</b-list-group-item>
          </b-list-group>
        </b-tab>
        <b-tab title="使い方・注意事項" >
          <b-list-group>
            <b-list-group-item>最初に現在地に移動します。位置情報の提供を許可してください。現在地情報は一切保管されません。なかなか移動しない場合はリロードしてみてください。</b-list-group-item>
            <b-list-group-item>閲覧は誰にでもできます。いたずらの防止のため、念のため情報の登録はGoogleアカウントによるログインをお願いしています。本サイトでは一切の認証情報を持たないため安心してお使いいただけます。Googleから連携される個人情報は氏名、メールアドレス、プロフィール画像の最低限としておりますが、それらの情報は一切他の目的に流用することはありません。</b-list-group-item>
            <b-list-group-item>上部のセレクトボックスから知りたい情報を選択してください。新しい種類の情報を追加を希望される場合は簡単にできますので遠慮なく管理者までご依頼ください。現在マップ上の表示領域に存在する情報が自動的に検索されます。表示領域を変えても自動的に追従します。</b-list-group-item>
            <b-list-group-item>情報には３種類のステータスを設けています。マーカーの色が緑「良好」、黄色「注意」、赤色「不可」です。登録時はどれかを選んでください。</b-list-group-item>
            <b-list-group-item>ログイン状態で地図上のマーカーが無い地点をクリックまたはタップすると新しい情報の登録ができます。</b-list-group-item>
            <b-list-group-item>既に情報が存在する地点のマーカーを選択すると詳しい情報が閲覧できます。新しい情報を登録する場合は「追加」ボタンを押してください。</b-list-group-item>
            <b-list-group-item>何かご不明な点や不具合のようなものを見つけた場合は管理者までご連絡ください。</b-list-group-item>
          </b-list-group>
        </b-tab>
        <b-tab title="お問い合わせ・ご要望">
          <b-list-group-item>ご質問やご要望は下記管理者連絡先までご連絡ください。</b-list-group-item>
          <b-list-group-item>Twitter: <b-link href="https://twitter.com/marcy_terui">@marcy_terui</b-link></b-list-group-item>
          <b-list-group-item>E-mail: <b-link href="mailto:supply-map@willy.works">supply-map@willy.works</b-link></b-list-group-item>
          <b-list-group-item>フロントエンドが得意ではないので良い感じにしてくれる開発者も歓迎します。</b-list-group-item>
          <b-list-group-item>GitHub: <b-link href="https://github.com/marcy-terui/supply-map">smarcy-terui/supply-map</b-link></b-list-group-item>
        </b-tab>
      </b-tabs>
    </div>
  </div>
</template>

<script>
import dateformat from 'dateformat'
import geoService from './services/geoService'
import firebaseService from './services/firebaseService'

const DEFAULT_MARKER_FORM = {
  comment: '',
  statusSelected: 'good',
  statusOptions: [
    { text: '✅ 良好', value: 'good' },
    { text: '⚠️ 注意', value: 'warn' },
    { text: '🚫 不可', value: 'ng' }
  ],
  statusEmoticons: {
    'good': '✅',
    'warn': '⚠️',
    'ng': '🚫'
  },
  statusColors: {
    'good': 'success',
    'warn': 'warning',
    'ng': 'danger'
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
      logged: false,
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
        { value: 'meats', text: '生鮮食品：肉類' },
        { value: 'seafoods', text: '生鮮食品：魚介類' },
        { value: 'vegetables', text: '生鮮食品：野菜類' },
        { value: 'milk', text: '生鮮食品：乳製品' },
        { value: 'transportation', text: '交通：公共交通機関' },
        { value: 'roads', text: '交通：道路状況' }
      ],
      user: null
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
    report () {
      firebaseService.addReport(
        this.collection,
        this.clickedPosition.lat,
        this.clickedPosition.lng,
        this.markerForm.comment,
        this.markerForm.statusSelected
      ).then((msg) => {
        this.loadMarkers()
        alert(msg)
      }).catch((msg) => {
        alert('登録に失敗しました。ログインしていない場合はログインをお願いします。')
      })
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
                status: this.markerForm.statusEmoticons[c.status],
                comment: c.comment,
                datetime: dt,
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
      this.$refs.markerModalRef.show()
    }
  },
  async mounted () {
    const position = await geoService.getCurrentPosition()

    this.$refs.mapRef.$mapObject.addListener('click', (e) => {
      this.clickedPosition = {
        lat: e.latLng.lat(),
        lng: e.latLng.lng()
      }
      this.markerForm = DEFAULT_MARKER_FORM
      this.$refs.markerModalRef.show()
    })

    this.$refs.mapRef.$mapObject.addListener('center_changed', (e) => {
      this.loadMarkers()
    })

    this.center = {
      lat: position.coords.latitude,
      lng: position.coords.longitude
    }

    this.user = this.getCurrentUserName()

    this.$watch('collection', (val) => {
      this.loadMarkers()
    })
  }
}
</script>

<style scoped lang="scss">
h1 {
  font-size: x-large
}
#map {
  position: relative;
  width: 100%;
  height: 600px;
  margin: 0;
  padding: 0
}
#addCommentBtn {
  margin-top: 4px
}
.navbar {
  width: 100%
}
.tabs {
  width: 100%
}
.navbarItem {
  margin: 5px;
  width: auto;
}
</style>
