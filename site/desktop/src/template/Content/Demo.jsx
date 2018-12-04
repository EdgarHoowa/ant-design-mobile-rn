/* eslint react/no-danger: 0 */
import { Button, Icon, Modal, Radio, Tooltip } from 'antd';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';
import { FormattedMessage } from 'react-intl';
import { ping } from '../../../../utils';

export default class Demo extends React.Component {
  static contextTypes = {
    intl: PropTypes.object,
  };

  state = {
    fullscreen: false,
    lang: 'es6',
    copied: false,
    sourceCode: '',
    showRiddleButton: false,
  };

  saveAnchor = (anchor) => {
    this.anchor = anchor;
  };

  componentDidMount() {
    const { meta } = this.props;
    if (meta.id === window.location.hash.slice(1)) {
      this.anchor.click();
    }
    this.componentWillReceiveProps(this.props);

    this.pingTimer = ping((status) => {
      if (status !== 'timeout' && status !== 'error') {
        this.setState({
          showRiddleButton: true,
        });
      }
    });
  }

  handleClick = (e) => {
    const { togglePreview, index, currentIndex, meta } = this.props;

    if (
      index !== currentIndex &&
      e.target.className !== 'collapse anticon anticon-circle-o-right' &&
      e.target.className !== 'fullscreen anticon anticon-arrow-salt'
    ) {
      togglePreview({
        index,
      });
    }

    window.location.hash = meta.id;
  };

  viewFullscreen = (e) => {
    e.stopPropagation();
    this.setState({
      fullscreen: true,
    });
  };

  handleCancel = () => {
    this.setState({
      fullscreen: false,
    });
  };

  handleCodeCopied = () => {
    this.setState({ copied: true });
  };

  onCopyTooltipVisibleChange = (visible) => {
    if (visible) {
      this.setState({
        copyTooltipVisible: visible,
        copied: false,
      });
      return;
    }
    this.setState({
      copyTooltipVisible: visible,
    });
  };

  handleProgrammingLangChange = (e) => {
    this.setState({ lang: e.target.value });
  };
  getSandboxParameters = (sourceCode) => {
    const sandboxName = `${this.props.doc.meta.title}`;
    const parameters = {
      files: {
        'public/index.html': {
          content: `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <link rel="shortcut icon" href="%PUBLIC_URL%/favicon.ico">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <meta name="theme-color" content="#000000">
    <!--
      manifest.json provides metadata used when your web app is added to the
      homescreen on Android. See https://developers.google.com/web/fundamentals/web-app-manifest/
    -->
    <link rel="manifest" href="%PUBLIC_URL%/manifest.json">
    <!--
      Notice the use of %PUBLIC_URL% in the tags above.
      It will be replaced with the URL of the public folder during the build.
      Only files inside the public folder can be referenced from the HTML.

      Unlike "/favicon.ico" or "favicon.ico", "%PUBLIC_URL%/favicon.ico" will
      work correctly both with client-side routing and a non-root public URL.
      Learn how to configure a non-root public URL by running npm run build.
    -->
    <title>React App</title>
  </head>
  <body>
    <noscript>
      You need to enable JavaScript to run this app.
    </noscript>
    <div id="root"></div>
  </body>
</html>
`,
        },
        'src/index.js': {
          content: `
import { AppRegistry } from "react-native";
import App from "./App";

AppRegistry.registerComponent("App", () => App);

AppRegistry.runApplication("App", {
  rootTag: document.getElementById("root")
});
`,
        },
        'src/App.js': {
          content: sourceCode,
        },
        'package.json': {
          content: {
            version: '0.2.0',
            scripts: {
              test: 'react-scripts test',
              start: 'react-scripts start',
              eject: 'react-scripts eject',
              build: 'react-scripts build',
            },
            private: true,
            name: sandboxName,
            eslintConfig: {
              extends: 'react-app',
            },
            dependencies: {
              '@ant-design/react-native': 'latest',
              'antd-mobile-rn-scripts': '2.1.5',
              react: '^16.6.0',
              'react-art': '^16.6.0',
              'react-dom': '^16.6.0',
              'react-native-web': '^0.9.6',
            },
            browserslist: [
              '>0.2%',
              'not dead',
              'not ie <= 11',
              'not op_mini all',
            ],
          },
        },
      },
    };
    return parameters;
  };
  sandbox = async () => {
    const { sourceCode } = this.state;
    if (!sourceCode) {
      return null;
    }
    const parameters = this.getSandboxParameters(sourceCode);
    const data = await fetch(
      'https://codesandbox.io/api/v1/sandboxes/define?json=1',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(parameters),
      },
    ).then(x => x.json());

    if (data) {
      this.setState({ sandbox_id: data.sandbox_id });
    }
    return data;
  };
  rendeSandbox = () => {
    const { sandbox_id: id } = this.state;
    if (!id) {
      return null;
    }
    return (
      <iframe
        title="example"
        src={`https://codesandbox.io/embed/${id}?autoresize=1&codemirror=1`}
        style={{
          width: '100%',
          height: '700px',
          border: 0,
          borderRadius: '4px',
          overflow: 'hidden',
        }}
        sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"
      />
    );
  };
  /* eslint-disable react/jsx-indent */
  renderDemoCode = (highlightedCode, inModal) => {
    const { meta, style } = this.props;
    const { lang, sourceCode } = this.state;
    const { locale } = this.context.intl;
    const localizedTitle = meta.title[locale] || meta.title;
    const prefillStyle = `@import 'antd-mobile@2/dist/antd-mobile.min.css';\n\n${style ||
      ''}`.replace(new RegExp(`#${meta.id}\\s*`, 'g'), '');

    const riddlePrefillConfig = {
      title: `${localizedTitle} - Ant Design Mobile RN Demo`,
      js: sourceCode.replace(
        "from '../../'",
        "from '@ant-design/react-native'",
      ),
      css: prefillStyle.replace("'antd-mobile/", "'antd-mobile/"),
    };
    return Array.isArray(highlightedCode) ? (
      <div className="highlight">
        <div className="code-box-actions">
          {this.state.showRiddleButton ? (
            <form
              action="//riddle.alibaba-inc.com/riddles/define"
              method="POST"
              target="_blank"
            >
              <input
                type="hidden"
                name="data"
                value={JSON.stringify(riddlePrefillConfig)}
              />
              <Tooltip title={<FormattedMessage id="app.demo.riddle" />}>
                <input
                  type="submit"
                  value="Create New Riddle with Prefilled Data"
                  className="code-box-riddle"
                />
              </Tooltip>
            </form>
          ) : null}
          <CopyToClipboard
            text={this.state.sourceCode}
            onCopy={this.handleCodeCopied}
          >
            <Tooltip
              title={
                <FormattedMessage
                  id={`app.demo.${this.state.copied ? 'copied' : 'copy'}`}
                />
              }
              visible={this.state.copyTooltipVisible}
              onVisibleChange={this.onCopyTooltipVisibleChange}
            >
              <span
                className="code-box-code-copy"
                onClick={e => e.stopPropagation()}
              >
                <Icon
                  type={
                    this.state.copied && this.state.copyTooltipVisible
                      ? 'check'
                      : 'copy'
                  }
                />
              </span>
            </Tooltip>
          </CopyToClipboard>
        </div>
        {this.props.utils.toReactComponent(highlightedCode)}
      </div>
    ) : (
      <div className="highlight">
        {inModal && (
          <Radio.Group value={lang} onChange={this.handleProgrammingLangChange}>
            <Radio.Button value="es6">ES2016</Radio.Button>
            <Radio.Button value="ts">TypeScript</Radio.Button>
          </Radio.Group>
        )}
        <pre className="language-jsx">
          <code dangerouslySetInnerHTML={{ __html: highlightedCode[lang] }} />
        </pre>
      </div>
    );
  };
  componentWillReceiveProps(nextProps) {
    const { highlightedCode } = nextProps;
    const div = document.createElement('div');
    div.innerHTML = highlightedCode[1].highlighted;
    this.setState(
      {
        sourceCode: this.replaceLibName(div.textContent),
      },
      () => this.sandbox(),
    );
  }
  replaceLibName = code => code.replace('../../', '@ant-design/react-native');
  render() {
    const { props, state } = this;
    const {
      meta,
      content,
      highlightedCode,
      highlightedStyle,
      className,
      utils,
    } = props;

    const codeBoxClass = classNames({
      'code-box': true,
      [className]: className,
    });

    const locale = this.context.intl.locale;
    const localizedTitle = meta.title[locale] || meta.title;
    const localizeIntro = content[locale] || content;
    const introChildren = utils.toReactComponent(['div'].concat(localizeIntro));

    const hsNode = highlightedStyle ? (
      <div key="style" className="highlight">
        <pre>
          <code
            className="css"
            dangerouslySetInnerHTML={{
              __html: highlightedStyle,
            }}
          />
        </pre>
      </div>
    ) : null;

    return (
      <section className={codeBoxClass} id={meta.id} onClick={this.handleClick}>
        <Modal
          ref="modal"
          visible={state.fullscreen}
          title={localizedTitle}
          onCancel={this.handleCancel}
          width={900}
          footer={[
            <Button
              key="back"
              type="ghost"
              size="large"
              onClick={this.handleCancel}
            >
              <FormattedMessage id="app.ComponentDoc.Modal.return" />
            </Button>,
          ]}
        >
          {this.renderDemoCode(highlightedCode, true)}
          {hsNode}
        </Modal>

        <section className="code-box-meta markdown">
          <div className="code-box-title">
            <a href={`#${meta.id}`} ref={this.saveAnchor}>
              {localizedTitle}
            </a>
            <span
              className="fullscreen anticon anticon-arrow-salt"
              onClick={this.viewFullscreen}
              unselectable="none"
              style={{ bottom: 'inherit', top: 16 }}
            />
          </div>
          {introChildren}

          {!Array.isArray(highlightedCode) && (
            <Radio.Group
              value={state.lang}
              onChange={this.handleProgrammingLangChange}
            >
              <Radio.Button value="es6">ES2016</Radio.Button>
              <Radio.Button value="ts">TypeScript</Radio.Button>
            </Radio.Group>
          )}
        </section>

        {/* <section className="highlight-wrapper" key="code">
          {this.renderDemoCode(highlightedCode, false)}
          {hsNode}
        </section> */}
        {this.rendeSandbox()}
      </section>
    );
  }
}
