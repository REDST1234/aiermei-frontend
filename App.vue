<script>
import { tracker } from '@/utils/tracker';

export default {
  onLaunch(options) {
    console.log('App Launch');
    if (options && options.query) {
      tracker.setUtmParams(options.query);
    }
  },
  onHide() {
    tracker.flush(); // 切后台强制上报
  }
};
</script>

<style lang="scss">
@import './uni.scss';
@import './styles/common.scss';

page {
  background: #f5f5f0;
  color: #111827;
  font-family: 'SF Pro Rounded', 'Nunito', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
  --top-safe-offset: calc(var(--status-bar-height) + 40rpx);
  --top-safe-offset-compact: calc(var(--status-bar-height) + 30rpx);
}
</style>
