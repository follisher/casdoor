// Copyright 2021 The casbin Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import React from "react";
import {Button, Card, Input, Select, Switch, Form, Space, Radio} from 'antd';
import * as PermissionBackend from "./backend/PermissionBackend";
import * as OrganizationBackend from "./backend/OrganizationBackend";
import * as UserBackend from "./backend/UserBackend";
import * as Setting from "./Setting";
import i18next from "i18next";
import * as RoleBackend from "./backend/RoleBackend";

const { Option } = Select;

class PermissionEditPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      classes: props,
      organizationName: props.organizationName !== undefined ? props.organizationName : props.match.params.organizationName,
      permissionName: props.match.params.permissionName,
      permission: null,
      organizations: [],
      users: [],
      roles: [],
    };
  }

  UNSAFE_componentWillMount() {
    this.getPermission();
    this.getOrganizations();
  }

  getPermission() {
    PermissionBackend.getPermission(this.state.organizationName, this.state.permissionName)
      .then((permission) => {
        this.setState({
          permission: permission,
        });

        this.getUsers(permission.owner);
        this.getRoles(permission.owner);
      });
  }

  getOrganizations() {
    OrganizationBackend.getOrganizations("admin")
      .then((res) => {
        this.setState({
          organizations: (res.msg === undefined) ? res : [],
        });
      });
  }

  getUsers(organizationName) {
    UserBackend.getUsers(organizationName)
      .then((res) => {
        this.setState({
          users: res,
        });
      });
  }

  getRoles(organizationName) {
    RoleBackend.getRoles(organizationName)
      .then((res) => {
        this.setState({
          roles: res,
        });
      });
  }

  parsePermissionField(key, value) {
    if ([""].includes(key)) {
      value = Setting.myParseInt(value);
    }
    return value;
  }

  updatePermissionField(key, value) {
    value = this.parsePermissionField(key, value);
    let permission = this.state.permission;
    permission[key] = value;
    this.setState({ permission });
  }

  updateFormField(key, value) {
    let form = this.state.form
    form[key] = value
    this.setState({ form })
  }

  renderPermission() {
    return (
      <Card size="small"
        title={
          <Space size={10}>
            {i18next.t("permission:Edit Permission")}
            <Button onClick={() => this.submitPermissionEdit(false)}>{i18next.t("general:Save")}</Button>
            <Button type="primary" onClick={() => this.submitPermissionEdit(true)}>{i18next.t("general:Save & Exit")}</Button>
          </Space>
        }
        style={(Setting.isMobile())? {margin: '5px'}:{}}
        type="inner"
      >
        <Form
          labelCol={{ span: 3 }}
          wrapperCol={{ span: 10 }}>
          <Form.Item label={Setting.getLabel(i18next.t("general:Organization"), i18next.t("general:Organization - Tooltip"))}>
            <Select
              virtual={false}
              value={this.state.permission.owner}
              onChange={(owner => {
                this.updatePermissionField('owner', owner);
                this.getUsers(owner);
                this.getRoles(owner);
              })}
            >
              {this.state.organizations.map((organization, index) => <Option key={index} value={organization.name}>{organization.name}</Option>)}
            </Select>
          </Form.Item>
          <Form.Item label={Setting.getLabel(i18next.t("general:Name"), i18next.t("general:Name - Tooltip"))}>
            <Input
              value={this.state.permission.name}
              onChange={e => {
                this.updatePermissionField('name', e.target.value)
              }}
            />
          </Form.Item>
          <Form.Item label={Setting.getLabel(i18next.t("general:Display name"), i18next.t("general:Display name - Tooltip"))}>
            <Input
              value={this.state.permission.displayName}
              onChange={e => {
                this.updatePermissionField('displayName', e.target.value);
              }}
            />
          </Form.Item>
          <Form.Item label={Setting.getLabel(i18next.t("role:Sub users"), i18next.t("role:Sub users - Tooltip"))}>
            <Select 
              virtual={false} 
              mode="tags"
              value={this.state.permission.users} 
              onChange={(value => {this.updatePermissionField('users', value);})}
            >
              {this.state.users.map((user, index) => <Option key={index} value={`${user.owner}/${user.name}`}>{`${user.owner}/${user.name}`}</Option>)}
            </Select>
          </Form.Item>
          <Form.Item label={Setting.getLabel(i18next.t("role:Sub roles"), i18next.t("role:Sub roles - Tooltip"))}>
            <Select 
              virtual={false} 
              mode="tags"  
              value={this.state.permission.roles} 
              onChange={(value => {this.updatePermissionField('roles', value);})}
            >
              {
                this.state.roles.filter(roles => (roles.owner !== this.state.roles.owner || roles.name !== this.state.roles.name)).map((permission, index) => <Option key={index} value={`${permission.owner}/${permission.name}`}>{`${permission.owner}/${permission.name}`}</Option>)
              }
            </Select>
          </Form.Item>
          <Form.Item label={Setting.getLabel(i18next.t("permission:Resource type"), i18next.t("permission:Resource type - Tooltip"))}>
            <Radio.Group
              defaultValue={this.state.permission.resourceType}
              onChange={
                e => {
                  this.updatePermissionField('resourceType', e.target.value);
                }
              }
            >
              <Radio value="Application">Application</Radio>
              <Radio value="Api">Api</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item label={Setting.getLabel(i18next.t("permission:Resources"), i18next.t("permission:Resources - Tooltip"))}>
            <Select
              virtual={false}
              mode="tags"
              value={this.state.permission.resources}
              onChange={(value => {
                this.updatePermissionField('resources', value);
              })}>
              {
                this.state.permission.resources.map((item, index) => <Option key={index} value={item.id}>{item.name}</Option>)
              }
            </Select>
          </Form.Item>
          <Form.Item label={Setting.getLabel(i18next.t("permission:Actions"), i18next.t("permission:Actions - Tooltip"))}>
            <Select
              virtual={false}
              mode="tags"
              value={this.state.permission.actions}
              onChange={(value => {
                this.updatePermissionField('actions', value);
              })}>
              {
                [
                  {id: 'Read', name: 'Read'},
                  {id: 'Write', name: 'Write'},
                  {id: 'Admin', name: 'Admin'},
                ].map((item, index) => <Option key={index} value={item.id}>{item.name}</Option>)
              }
            </Select>
          </Form.Item>
          <Form.Item label={Setting.getLabel(i18next.t("permission:Effect"), i18next.t("permission:Effect - Tooltip"))}>
            <Select
              virtual={false} 
              value={this.state.permission.effect}
              onChange={(value => {
                this.updatePermissionField('effect', value);
              })}
            >
              {
                [
                  {id: 'Allow', name: 'Allow'},
                  {id: 'Deny', name: 'Deny'},
                ].map((item, index) => <Option key={index} value={item.id}>{item.name}</Option>)
              }
            </Select>
          </Form.Item>
          <Form.Item label={Setting.getLabel(i18next.t("general:Is enabled"), i18next.t("general:Is enabled - Tooltip"))}>
            <Switch
              checked={this.state.permission.isEnabled}
              onChange={checked => {
                this.updatePermissionField('isEnabled', checked);
              }}
            />
          </Form.Item>
        </Form>
      </Card>
    )
  }

  submitPermissionEdit(willExist) {
    let permission = Setting.deepCopy(this.state.permission);
    PermissionBackend.updatePermission(this.state.organizationName, this.state.permissionName, permission)
      .then((res) => {
        if (res.msg === "") {
          Setting.showMessage("success", `Successfully saved`);
          this.setState({
            permissionName: this.state.permission.name,
          });

          if (willExist) {
            this.props.history.push(`/permissions`);
          } else {
            this.props.history.push(`/permissions/${this.state.permission.owner}/${this.state.permission.name}`);
          }
        } else {
          Setting.showMessage("error", res.msg);
          this.updatePermissionField('name', this.state.permissionName);
        }
      })
      .catch(error => {
        Setting.showMessage("error", `Failed to connect to server: ${error}`);
      });
  }

  render() {
    return (
      <Form>
        {
          this.state.permission !== null ? this.renderPermission() : null
        }
        <Form.Item style={{marginTop: '20px', marginLeft: '40px'}}>
          <Button size="large" onClick={() => this.submitPermissionEdit(false)}>{i18next.t("general:Save")}</Button>
          <Button style={{marginLeft: '20px'}} type="primary" size="large" onClick={() => this.submitPermissionEdit(true)}>{i18next.t("general:Save & Exit")}</Button>
        </Form.Item>
      </Form>
    );
  }
}

export default PermissionEditPage;
