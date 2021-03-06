'use strict';

import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Navigator,
  AppState,
  Text,
  View,
  ToolbarAndroid,
  BackAndroid,
  Linking,
} from 'react-native';

import StoryActions from './actions/StoryActions';
import StoriesView from './views/StoriesView';
import CommentsView from './views/CommentsView';
import AboutView from './views/AboutView';

import colors from './colors';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  wrapper: {
    backgroundColor: colors.viewBackgroundColor,
  },
  toolbar: {
    backgroundColor: colors.toolbarBackgroundColor,
    height: 56,
    elevation: 2,
  },
});

let _navigator;

BackAndroid.addEventListener('hardwareBackPress', () => {
  if (_navigator.getCurrentRoutes().length == 1){
    return false;
  }
  _navigator.pop();
  return true;
});

class HackerWeb extends Component {
  constructor(props){
    super(props);
    this.state = {
      currentAppState: AppState.currentState,
    };
    this._handleAppStateChange = this._handleAppStateChange.bind(this);
  }
  componentDidMount(){
    AppState.addEventListener('change', this._handleAppStateChange);
    Linking.getInitialURL().then((url) => {
      if (!url) return;
      const id = (url.match(/item\?id=([a-z\d]+)/i) || [,null])[1];
      if (!id) return;
      _navigator.push({
        id: 'Comments',
        component: CommentsView,
        wrapperStyle: styles.wrapper,
        passProps: {
          data: {id},
        }
      });
    }).catch(() => {});
  }
  componentWillUnmount(){
    AppState.removeEventListener('change', this._handleAppStateChange);
  }
  _handleAppStateChange(currentAppState){
    if (currentAppState == 'active' && this.state.currentAppState != currentAppState){
      StoryActions.fetchStoriesIfExpired();
    }
    this.setState({
      currentAppState,
    });
  }
  _navigatorRenderScene(route, navigator){
    _navigator = navigator;
    switch (route.id){
      case 'Stories':
        return <View style={styles.container}>
          <ToolbarAndroid
            title="HackerWeb"
            titleColor={colors.primaryTextColor}
            style={styles.toolbar}
            actions={[
              {
                title: 'Reload',
                icon: require('./images/refresh-icon.png'),
                show: 'always',
              },
              { title: 'About' },
            ]}
            onActionSelected={(position) => {
              switch (position){
                case 0:
                  StoryActions.fetchStories();
                  break;
                case 1:
                  navigator.push({
                    id: 'About',
                  });
                  break;
              }
            }}
          />
          <StoriesView navigator={navigator} />
        </View>;
      case 'Comments':
        const { component, title, passProps, rightButtonIcon, onRightButtonPress } = route;
        const TheComponent = component;
        return <View style={[styles.container, styles.wrapper]}>
          <ToolbarAndroid
            title={title}
            titleColor={colors.primaryTextColor}
            style={styles.toolbar}
            navIcon={require('./images/arrow-back.png')}
            onIconClicked={navigator.pop}
            actions={[{
              title: 'Share',
              icon: rightButtonIcon,
              show: 'always'
            }]}
            onActionSelected={onRightButtonPress}
          />
            <TheComponent navigator={navigator} {...passProps}/>
          </View>;
      case 'About':
        return <View style={[styles.container, styles.wrapper]}>
          <ToolbarAndroid
            title="About"
            titleColor={colors.primaryTextColor}
            style={styles.toolbar}
          />
          <AboutView />
        </View>;
    }
  }
  render(){
    return (
      <Navigator
        initialRoute={{id: 'Stories'}}
        renderScene={this._navigatorRenderScene}
        configureScene={() => Navigator.SceneConfigs.FloatFromBottomAndroid}
      />
    );
  }
}

AppRegistry.registerComponent('HackerWeb', () => HackerWeb);
