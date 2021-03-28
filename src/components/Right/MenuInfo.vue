<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>菜单管理</el-breadcrumb-item>
      <el-breadcrumb-item>菜单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!--菜单视图-->
    <el-card>
      <!-- 添加菜单按钮区域 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="addDialogOpen">添加菜单</el-button>
        </el-col>
      </el-row>
    </el-card>
    <el-table :data="menuList" border stripe>
      <el-table-column type="index"></el-table-column>
      <el-table-column label="菜单名称" prop="name"></el-table-column>
      <el-table-column label="描述" prop="description"></el-table-column>
      <el-table-column label="路径" prop="url"></el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="primary"
            icon="el-icon-edit"
            @click="updateDialog(scope.row.id)"
            >编辑</el-button
          >
          <el-button
            size="mini"
            type="danger"
            icon="el-icon-delete"
            @click="deleteMenuById(scope.row.id)"
            >删除</el-button
          >
        </template>
      </el-table-column>
      <!-- <el-table-column label="等级" prop></el-table-column> -->
    </el-table>
    <el-card>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>

    <el-dialog
      title="添加菜单"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addDialogClosed"
    >
      <el-form :model="addMenuForm" ref="addFormRef" label-width="90px">
        <el-form-item label="菜单名称" prop="name">
          <el-input v-model="addMenuForm.name"></el-input>
        </el-form-item>

        <el-form-item label="菜单描述" prop="description">
          <el-input v-model="addMenuForm.description"></el-input>
        </el-form-item>
        <el-form-item label="菜单路径" prop="url">
          <el-input v-model="addMenuForm.url"></el-input>
        </el-form-item>
        <el-form-item label="父级菜单" prop="parentId">
          <el-select
            v-model="updateMenuForm.parentId"
            placeholder="请选择"
            style="width: 100%"
          >
            <el-option
              v-for="item in parentInfo"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addMenuInfo">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog
      title="更新菜单"
      :visible.sync="updateDialogVisible"
      width="50%"
      @close="updateDialogClosed"
    >
      <el-form :model="updateMenuForm" ref="updateFormRef" label-width="90px">
        <el-form-item label="菜单名称" prop="name">
          <el-input v-model="updateMenuForm.name"></el-input>
        </el-form-item>

        <el-form-item label="菜单描述" prop="description">
          <el-input v-model="updateMenuForm.description"></el-input>
        </el-form-item>
        <el-form-item label="菜单路径" prop="url">
          <el-input v-model="updateMenuForm.url"></el-input>
        </el-form-item>
        <el-form-item label="父级菜单" prop="parentId">
          <el-select
            v-model="updateMenuForm.parentId"
            placeholder="请选择"
            style="width: 100%"
          >
            <el-option
              v-for="item in parentInfo"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="updateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="updateMenuInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
//  "id": "string",
//   "name": "string",
//   "type": "string",
//   "url": "string",
//   "permission": "string",
//   "parentId": "string",
//   "sort": 0,
//   "external": 0,
//   "available": 0,
//   "icon": "string",
//   "createTime": "2021-03-27T14:14:59.242Z",
//   "updateTime": "2021-03-27T14:14:59.242Z"
import {
  getSysResoureces,
  getSysResoureceById,
  getSysResourcesPage,
  addSysResource,
  updateSysResource,
  deleteSysResource,
} from "../../api/index";
import { getGuid } from "../../utilites";
export default {
  data() {
    return {
      queryInfo: {
        name: "",
        // 当前的页数
        pageIndex: 1,
        // 当前每页显示多少条数据
        pageSize: 5,
      },
      menuList: [],
      addList: {},
      updateList: {},
      total: 0,
      addMenuForm: {
        id: "",
        name: "",
        url: "",
        parentId: "",
        desciption: "", //临时当描述的含义
      },
      addDialogVisible: false,
      updateMenuForm: {},
      updateDialogVisible: false,
      parentInfo: [],
    };
  },
  created() {
    this.getMenuInfo();
  },
  methods: {
    // 监听 页码值 改变的事件
    handleCurrentChange(newPage) {
      console.log(newPage);
      this.queryInfo.pageIndex = newPage;
      this.getMenuInfo();
    },
    handleSizeChange(newSize) {
      // console.log(newSize)
      this.queryInfo.pagesize = newSize;
      this.getMenuInfo();
    },
    async getMenuInfo() {
      const { data } = await getSysResourcesPage(this.queryInfo);
      if (data.success != true) {
        return this.$message.error("获取用户列表失败！");
      }
      this.menuList = data.response.data;
      this.total = data.response.total;
    },
    async addDialogOpen() {
      await this.getParentInfo();
      this.addDialogVisible = true;
    },
    async addMenuInfo() {
      this.addMenuForm.id = getGuid();
      this.addMenuForm.createTime = new Date();
      const { data } = await addSysResource(this.addMenuForm);
      if (data.success == true) {
        this.$message.success("添加菜单成功！");
        // // 隐藏添加用户的对话框
        this.addDialogVisible = false;
        // 重新获取用户列表数据
        this.getMenuInfo();
      } else {
        this.$message.error("添加菜单失败！");
      }
    },
    addDialogClosed() {
      this.$refs.addFormRef.resetFields();
    },
    async updateDialog(id) {
      const { data } = await getSysResoureceById(id);
      await this.getParentInfo();

      this.parentInfo = this.parentInfo.filter((o) => {
        if (o.value != id) return o;
      });

      this.updateMenuForm = data.response;
      this.updateDialogVisible = true;
    },
    async updateMenuInfo() {
      const { data } = await updateSysResource(this.updateMenuForm);
      if (data.success != true) {
        this.$message.error("更新菜单失败！");
      }
      this.$message.success("更新菜单成功！");
      // // 隐藏添加用户的对话框
      this.updateDialogVisible = false;
      // 重新获取用户列表数据
      this.getMenuInfo();
    },
    updateDialogClosed() {
      this.$refs.updateFormRef.resetFields();
    },
    async deleteMenuById(id) {
      // 弹框询问用户是否删除数据
      const confirmResult = await this.$confirm(
        "此操作将永久删除该菜单, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).catch((err) => err);
      // 如果用户确认删除，则返回值为字符串 confirm
      // 如果用户取消了删除，则返回值为字符串 cancel
      if (confirmResult !== "confirm") {
        return this.$message.info("已取消删除");
      }
      const { data } = await deleteSysResource(id);
      if (data.success !== true) {
        return this.$message.error("删除菜单失败！");
      }
      this.$message.success("删除菜单成功！");
      this.getMenuInfo();
    },

    async getParentInfo() {
      const { data } = await getSysResoureces();
      this.parentInfo = data.response.map((o) => {
        return {
          value: o.id,
          label: o.name,
        };
      });
      this.parentInfo.unshift({
        value: "0",
        label: "无",
      });
    },
  },
};
</script>
<style lang="less" scoped>
</style>