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
          <el-button type="primary" @click="setAddRoleDialogOpen"
            >添加角色</el-button
          >
        </el-col>
      </el-row>

      <!-- 角色列表区域 -->
      <el-table :data="rolelist" border stripe>
        <!-- 展开列 -->

        <!-- 索引列 -->
        <el-table-column type="index"></el-table-column>
        <el-table-column label="角色名称" prop="name"></el-table-column>
        <el-table-column label="角色描述" prop="description"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template slot-scope="scope">
            <el-button
              size="mini"
              type="primary"
              icon="el-icon-edit"
              @click="showUpdateDialog(scope.row.id)"
              >编辑</el-button
            >
            <el-button
              size="mini"
              type="danger"
              icon="el-icon-delete"
              @click="deleteRole(scope.row.id)"
              >删除</el-button
            >
            <el-button
              size="mini"
              type="warning"
              icon="el-icon-setting"
              @click="showSetRightDialog(scope.row.id)"
              >分配权限</el-button
            >
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
        node-key="Id"
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
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="90px"
      >
        <el-form-item label="角色" prop="name">
          <el-input v-model="addForm.name"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="description">
          <el-input v-model="addForm.description"></el-input>
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
      <el-form
        :model="updateForm"
        :rules="addFormRules"
        ref="updateFormRef"
        label-width="90px"
      >
        <el-form-item label="角色" prop="name">
          <el-input v-model="updateForm.name"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="description">
          <el-input v-model="updateForm.description"></el-input>
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
import {
  getSysRolesPage,
  updateSysRole,
  getSysRoleById,
  addSysRole,
  deleteSysRole,
  getSysResoureces,
  getTreeUrls,
  addRoleResourece,
  getRoleResourceByRoleId,
  updateRoleResources,
} from "../../api/index";
import { getGuid } from "../../utilites";
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
            trigger: "blur",
          },
        ],
        des: [
          { required: true, message: "请输入描述", trigger: "blur" },
          {
            min: 3,
            max: 15,
            message: "用户名的长度在6~15个字符之间",
            trigger: "blur",
          },
        ],
      },
      //添加数据form
      addForm: {
        id: "",
        name: "",
        description: "",
      },
      //更新数据form
      updateForm: {},
      // 所有角色列表数据
      rolelist: [],
      queryInfo: {
        // 当前的页数
        pageIndex: 1,
        // 当前每页显示多少条数据
        pageSize: 5,
        roleName: "",
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
        label: "Name",
        children: "Children",
      },
      // 默认选中的节点Id值数组
      defKeys: [],
      // 当前即将分配权限的角色id
      roleId: "",

      isUpdateRight: false,
      UpdateRight: {},
    };
  },
  created() {
    this.getRolesList();
  },
  methods: {
    // 获取所有角色的列表
    async getRolesList() {
      const { data } = await getSysRolesPage(this.queryInfo);
      if (data.success != true) {
        return this.$message.error("获取角色列表失败！");
      }
      this.rolelist = data.response.data;
      this.total = data.response.total;
    },

    handleSizeChange(newSize) {
      // console.log(newSize)
      this.queryInfo.pagesize = newSize;
      this.getRolesList();
    },
    // 监听 页码值 改变的事件
    handleCurrentChange(newPage) {
      this.queryInfo.pageIndex = newPage;
      this.getRolesList();
    },
    //打开对话框
    setAddRoleDialogOpen() {
      this.addRoleInfoDialogVisible = true;
    },

    async addRole() {
      this.addForm.id = getGuid();
      this.addForm.createTime = new Date();
      const { data } = await addSysRole(this.addForm);
      if (data.success == true) {
        this.$message.success("添加角色成功！");
        // // 隐藏添加用户的对话框
        this.addRoleInfoDialogVisible = false;
        // 重新获取用户列表数据
        this.getRolesList();
      } else {
        this.$message.error("添加角色失败！");
      }
    },
    //关闭添加的对话框
    setAddRoleDialogClosed() {
      this.$refs.addFormRef.resetFields();
    },
    //打开数据更新窗口
    async showUpdateDialog(id) {
      const { data } = await getSysRoleById(id);
      if (data.success != true) {
        this.$message.error("角色获取失败！");
        return;
      }
      this.updateForm = data.response;
      this.updateDialogVisible = true;
    },
    //更新角色的方法
    async updateRole() {
      const { data } = await updateSysRole(this.updateForm);
      if (data.success == true) {
        this.$message.success("更新角色成功！");
        // // 隐藏添加用户的对话框
        this.updateDialogVisible = false;
        // 重新获取用户列表数据
        this.getRolesList();
        return;
      } else {
        this.$message.error("更新角色失败！");
        this.updateDialogVisible = false;
      }
    },

    //关闭更新对话框的方法
    updateRoleClosed() {
      this.$refs.updateFormRef.resetFields();
    },
    async deleteRole(id) {
      // 弹框提示用户是否要删除
      const confirmResult = await this.$confirm(
        "此操作将永久删除该角色, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).catch((err) => err);

      if (confirmResult !== "confirm") {
        return this.$message.info("取消了删除！");
      }
      const { data } = await deleteSysRole(id);
      if (data.success == true) {
        this.$message.success("删除角色成功");
        this.getRolesList();
      } else {
        return this.$message.error("删除角色失败！");
      }
    },
    // 根据Id删除对应的权限 有问题
    async removeRightById(role, rightId) {
      // 弹框提示用户是否要删除
      const confirmResult = await this.$confirm(
        "此操作将永久删除, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).catch((err) => err);

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
    async showSetRightDialog(roleId) {
      this.roleId = roleId;
      await this.getRights(roleId);
      await this.getMenuData(); //获取权限数据

      if (this.rightslist.length > 0) {
        this.setRightDialogVisible = true;
      }
    },
    //获取选中得信息
    getLeafKeys(node) {
      this.defKeys = [];
      if (node !== null) {
        node.forEach((item) => {
          if (item.fatherId !== "0") {
            this.defKeys.push(item.menuInfoId);
          }
        });
      }
    },
    // 监听分配权限对话框的关闭事件
    setRightDialogClosed() {
      this.defKeys.splice(0, this.defKeys.length);
    },
    // 点击为角色分配权限
    async allotRights() {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys(),
      ];
      const idStr = keys.join(",");
      if (this.isUpdateRight) {
        this.UpdateRight.resourcesId = idStr;
        debugger;
        const { data } = await updateRoleResources(this.UpdateRight);
        if (data.success != true) {
          return this.$message.error("分配权限失败！");
        }
      } else {
        const roleResource = {
          id: getGuid(),
          roleId: this.roleId,
          resourcesId: idStr,
        };
        const { data } = await addRoleResourece(roleResource);
        if (data.success != true) {
          return this.$message.error("分配权限失败！");
        }
      }
      this.$message.success("分配权限成功！");
      this.setRightDialogVisible = false;
    },

    //获取选中得权限
    async getRights(roleId) {
      //获取选中的数据
      const res = await getRoleResourceByRoleId(roleId);
      const rights = res.data.response;
      if (rights != null) {
        this.isUpdateRight = true;
        this.UpdateRight = rights;
      }

      //获取所有的数据
      const res2 = await getSysResoureces();
      const allMeunInfos = res2.data.response;

      //用选中的数据 过滤出其完整信息 这个操作可以放到后端
      let newArr = [];
      allMeunInfos.forEach((item) => {
        rights.resourcesId.split(",").forEach((o) => {
          if (o == item.id) {
            newArr.push(item);
          }
        });
      });

      //判断选中的节点是否有子节点 如果有则舍弃 再判断是否为父节点 解决父节点半选显示的问题
      newArr.forEach((item) => {
        const childArr = allMeunInfos.filter((o) => {
          if (o.parentId == item.id) return o;
        });

        if (item.parentId == "0" && childArr.length <= 0)
          this.defKeys.push(item.id);
        else if (item.parentId != "0") this.defKeys.push(item.id);
      });
    },
    //获取所有得权限信息
    async getMenuData() {
      const { data } = await getTreeUrls();
      this.rightslist = JSON.parse(data.response);
      if (data.success !== true) {
        return this.$message.error("获取权限数据失败！");
      }
    },
  },
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
