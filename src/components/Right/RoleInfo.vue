<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>角色管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <!-- 添加角色按钮区域 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="setAddRoleDialogOpen">添加角色</el-button>
        </el-col>
      </el-row>

      <!-- 角色列表区域 -->
      <el-table :data="rolelist" border stripe>
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row
              :class="['bdbottom', i1 === 0 ? 'bdtop' : '', 'vcenter']"
              v-for="(item1, i1) in scope.row.children"
              :key="item1.id"
            >
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag closable @close="removeRightById(scope.row, item1.id)">{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二级和三级权限 -->
              <el-col :span="19">
                <!-- 通过 for 循环 嵌套渲染二级权限 -->
                <el-row
                  :class="[i2 === 0 ? '' : 'bdtop', 'vcenter']"
                  v-for="(item2, i2) in item1.children"
                  :key="item2.id"
                >
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      closable
                      @close="removeRightById(scope.row, item2.id)"
                    >{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag
                      type="warning"
                      v-for="item3 in item2.children"
                      :key="item3.id"
                      closable
                      @close="removeRightById(scope.row, item3.id)"
                    >{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index"></el-table-column>
        <el-table-column label="角色名称" prop="role"></el-table-column>
        <el-table-column label="角色描述" prop="des"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template slot-scope="scope">
            <el-button
              size="mini"
              type="primary"
              icon="el-icon-edit"
              @click="showUpdateDialog(scope.row.roleId)"
            >编辑</el-button>
            <el-button
              size="mini"
              type="danger"
              icon="el-icon-delete"
              @click="deleteRole(scope.row.roleId)"
            >删除</el-button>
            <el-button
              size="mini"
              type="warning"
              icon="el-icon-setting"
              @click="showSetRightDialog(scope.row)"
            >分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!--分页-->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pageIndex"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>

    <!-- 分配权限的对话框 -->
    <el-dialog
      title="分配权限"
      :visible.sync="setRightDialogVisible"
      width="50%"
      @close="setRightDialogClosed"
    >
      <!-- 树形控件 -->
      <el-tree
        :data="rightslist"
        :props="treeProps"
        show-checkbox
        node-key="menuInfoId"
        default-expand-all
        :default-checked-keys="defKeys"
        ref="treeRef"
      ></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 添加角色 -->
    <el-dialog
      title="添加角色"
      :visible.sync="addRoleInfoDialogVisible"
      width="50%"
      @close="setAddRoleDialogClosed"
    >
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="90px">
        <el-form-item label="角色" prop="role">
          <el-input v-model="addForm.role"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="des">
          <el-input v-model="addForm.des"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addRoleInfoDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRole">确 定</el-button>
      </span>
    </el-dialog>
    <!--角色更新-->
    <el-dialog
      title="角色更新"
      :visible.sync="updateDialogVisible"
      width="50%"
      @close="updateRoleClosed"
    >
      <el-form :model="updateForm" :rules="addFormRules" ref="updateFormRef" label-width="90px">
        <el-form-item label="角色" prop="role">
          <el-input v-model="updateForm.role"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="des">
          <el-input v-model="updateForm.des"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="updateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="updateRole">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      //更新窗口是否可见
      updateDialogVisible: false,
      //添加角色验证规则
      addFormRules: {
        role: [
          { required: true, message: "请输入角色", trigger: "blur" },
          {
            min: 3,
            max: 10,
            message: "用户名的长度在3~10个字符之间",
            trigger: "blur"
          }
        ],
        des: [
          { required: true, message: "请输入描述", trigger: "blur" },
          {
            min: 3,
            max: 15,
            message: "用户名的长度在6~15个字符之间",
            trigger: "blur"
          }
        ]
      },
      //添加数据form
      addForm: {
        role: "",
        des: ""
      },
      //更新数据form
      updateForm: {},
      // 所有角色列表数据
      rolelist: [],
      queryInfo: {
        // 当前的页数
        pageIndex: 1,
        // 当前每页显示多少条数据
        pagesize: 5
      },
      //数据总条数
      total: 0,
      //控制角色添加显示和隐藏
      addRoleInfoDialogVisible: false,
      // 控制分配权限对话框的显示与隐藏
      setRightDialogVisible: false,
      // 所有权限的数据
      rightslist: [],
      //角色所拥有的权限
      roleRights: {},
      // 树形控件的属性绑定对象
      treeProps: {
        label: "menuName",
        children: "children"
      },
      // 默认选中的节点Id值数组
      defKeys: [],
      // 当前即将分配权限的角色id
      roleId: ""
    };
  },
  created() {
    this.getRolesList();
  },
  methods: {

    // 获取所有角色的列表
    async getRolesList() {
      const { data: res } = await this.$http.get("Manager/GetRoleInfos", {
        params: {
          pageSize: this.queryInfo.pagesize,
          pageIndex: this.queryInfo.pageIndex
        }
      });
      console.log(res);
      if (res.status !== 200) {
        return this.$message.error("获取角色列表失败！");
      }

      this.rolelist = res.data.roleData;
      this.total = res.data.total;
    },

    handleSizeChange(newSize) {
      // console.log(newSize)
      this.queryInfo.pagesize = newSize;
      this.getRolesList();
    },
    // 监听 页码值 改变的事件
    handleCurrentChange(newPage) {
      console.log(newPage);
      this.queryInfo.pageIndex = newPage;
      this.getRolesList();
    },
    //打开对话框
    setAddRoleDialogOpen() {
      this.addRoleInfoDialogVisible = true;
    },

    addRole() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return;
        console.log(this.addForm);

        const { data: res } = await this.$http.post(
          "Manager/AddRoleInfo",
          this.addForm
        );
        if (res.status !== 200) {
          this.$message.error("添加角色失败！");
        }

        this.$message.success("添加角色成功！");
        // // 隐藏添加用户的对话框
        this.addRoleInfoDialogVisible = false;
        // 重新获取用户列表数据
        this.getRolesList();
      });
    },
    //关闭添加的对话框
    setAddRoleDialogClosed() {
      this.$refs.addFormRef.resetFields();
    },
    //打开数据更新窗口
    async showUpdateDialog(roleId) {
      console.log(roleId);
      const { data: res } = await this.$http.get("Manager/GetRoleInfoById", {
        params: {
          roleId: roleId
        }
      });
      if (res.status !== 200) {
        this.$message.error("角色获取失败！");
        return;
      }
      console.log(res);
      this.updateForm = res.data;
      this.updateDialogVisible = true;
    },
    //更新角色的方法
    updateRole() {
      this.$refs.updateFormRef.validate(async valid => {
        if (!valid) return;
        console.log(this.updateForm);

        const { data: res } = await this.$http.put(
          "Manager/UpdateRoleInfo",
          this.updateForm
        );
        if (res.status !== 200) {
          this.$message.error("更新角色失败！");
          this.updateDialogVisible = false;
          return;
        }

        this.$message.success("更新角色成功！");
        // // 隐藏添加用户的对话框
        this.updateDialogVisible = false;
        // 重新获取用户列表数据
        this.getRolesList();
      });
    },

    //关闭更新对话框的方法
    updateRoleClosed() {
      this.$refs.updateFormRef.resetFields();
    },
    async deleteRole(roleId) {
      // 弹框提示用户是否要删除
      const confirmResult = await this.$confirm(
        "此操作将永久删除该文件, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }
      ).catch(err => err);

      if (confirmResult !== "confirm") {
        return this.$message.info("取消了删除！");
      }

      const { data: res } = await this.$http.delete("Manager/DeleteRoleInfo", {
        params: { roleId: roleId }
      });
      if (res.status !== 200) {
        return this.$message.error("删除权限失败！");
      }

      this.getRolesList();
    },
    // 根据Id删除对应的权限 有问题
    async removeRightById(role, rightId) {
      // 弹框提示用户是否要删除
      const confirmResult = await this.$confirm(
        "此操作将永久删除该文件, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }
      ).catch(err => err);

      if (confirmResult !== "confirm") {
        return this.$message.info("取消了删除！");
      }

      const { data: res } = await this.$http.delete(
        `roles/${role.id}/rights/${rightId}`
      );

      if (res.meta.status !== 200) {
        return this.$message.error("删除权限失败！");
      }

      // this.getRolesList()
      role.children = res.data;
    },
    // 展示分配权限的对话框
    async showSetRightDialog(role) {
      this.roleId = role.roleId;

      //得到所有的权限树
      const { data: res } = await this.$http.get("Manager/GetMenuTree");

      if (res.status !== 200) {
        return this.$message.error("获取权限数据失败！");
      }

      // 把获取到的权限数据保存到 data 中
      this.rightslist = res.data;

      var { data: menuInfos } = await this.$http.get(
        "Manager/GetRoleMenusByRoleId",
        {
          params: {
            roleId: this.roleId
          }
        }
      );

      this.getLeafKeys(menuInfos.data);
      // this.test();
      this.setRightDialogVisible = true;
    },

    getLeafKeys(node) {
      this.defKeys = [];
      if (node !== null) {
        node.forEach(item => {
          if (item.fatherId !== "0") {
            this.defKeys.push(item.menuInfoId);
          }
        });
      }
    },
    // 监听分配权限对话框的关闭事件
    setRightDialogClosed() {
      this.defKeys.splice(0, this.defKeys.length);
      //this.defKeys = [];
      console.log(this.defKeys);
    },
    // 点击为角色分配权限
    async allotRights() {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ];

      const idStr = keys.join(",");

      console.log(idStr);
      var roleId = this.roleId;
      var roleMenu = {
        roleId: roleId,
        menuInfoId: idStr
      };

      const { data: res } = await this.$http.post(
        "Manager/SetRoleMenu",
        roleMenu
      );
      console.log(res);
      if (res.status !== 200) {
        return this.$message.error("分配权限失败！");
      }

      this.$message.success("分配权限成功！");
      // this.getRolesList();
      this.setRightDialogVisible = false;
    }
  }
};
</script>

<style lang="less" scoped>
.el-tag {
  margin: 7px;
}

.bdtop {
  border-top: 1px solid #eee;
}

.bdbottom {
  border-bottom: 1px solid #eee;
}

.vcenter {
  display: flex;
  align-items: center;
}
</style>
