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
      <el-table-column label="菜单名称" prop="menuName"></el-table-column>
      <el-table-column label="描述" prop="menyDes"></el-table-column>
      <el-table-column label="路径" prop="menuUrl"></el-table-column>
      <el-table-column label="菜单ID" prop="selfId"></el-table-column>
      <el-table-column label="父Id" prop="fatherId"></el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="primary"
            icon="el-icon-edit"
            @click="updateDialog(scope.row.menuInfoId)"
          >编辑</el-button>
          <el-button
            size="mini"
            type="danger"
            icon="el-icon-delete"
            @click="deleteMenuById(scope.row.menuInfoId)"
          >删除</el-button>
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

    <el-dialog title="添加菜单" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
      <el-form :model="addMenuForm" ref="addFormRef" label-width="90px">
        <el-form-item label="菜单ID" prop="selfId">
          <el-input v-model="addMenuForm.selfId"></el-input>
        </el-form-item>
        <el-form-item label="父ID" prop="fatherId">
          <el-input v-model="addMenuForm.fatherId"></el-input>
        </el-form-item>
        <el-form-item label="菜单名称" prop="menuName">
          <el-input v-model="addMenuForm.menuName"></el-input>
        </el-form-item>
        <el-form-item label="菜单图标" prop="des">
          <el-input v-model="addMenuForm.menuIcon"></el-input>
        </el-form-item>
        <el-form-item label="菜单描述" prop="menyDes">
          <el-input v-model="addMenuForm.menyDes"></el-input>
        </el-form-item>
        <el-form-item label="菜单路径" prop="menuUrl">
          <el-input v-model="addMenuForm.menuUrl"></el-input>
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
        <el-form-item label="菜单ID" prop="selfId">
          <el-input v-model="updateMenuForm.selfId"></el-input>
        </el-form-item>
        <el-form-item label="父ID" prop="fatherId">
          <el-input v-model="updateMenuForm.fatherId"></el-input>
        </el-form-item>
        <el-form-item label="菜单名称" prop="menuName">
          <el-input v-model="updateMenuForm.menuName"></el-input>
        </el-form-item>
        <el-form-item label="菜单图标" prop="des">
          <el-input v-model="updateMenuForm.menuIcon"></el-input>
        </el-form-item>
        <el-form-item label="菜单描述" prop="menyDes">
          <el-input v-model="updateMenuForm.menyDes"></el-input>
        </el-form-item>
        <el-form-item label="菜单路径" prop="menuUrl">
          <el-input v-model="updateMenuForm.menuUrl"></el-input>
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
export default {
  data() {
    return {  
        queryInfo: {
        query: "",
        // 当前的页数
        pageIndex: 1,
        // 当前每页显示多少条数据
        pagesize: 5
      },
      menuList: [],
      addList: {},
      updateList: {},
      total: 0,
      addMenuForm: {
        selfId: "",
        fatherId: "",
        menuUrl: "",
        menuName: "",
        menuIcon: "",
        menyDes: ""
      },
      addDialogVisible: false,
      updateMenuForm: {},
      updateDialogVisible: false
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
      const {data:res} = await this.$http.get("Manager/GetMenusByQueryInfo",{   
          params: {
            pageSize: this.queryInfo.pagesize,
            pageIndex: this.queryInfo.pageIndex
          }
        });

      console.log(res);
      if (res.status !== 200) {
        return this.$message.error("获取用户列表失败！");
      }
      this.menuList = res.data.menuData;
      this.total = res.data.total;
      console.log(this.menuList);
    },
    addDialogOpen() {
      this.addDialogVisible = true;
    },
    async addMenuInfo() {
      const {data:res} = await this.$http.post(
        "Manager/AddMenuInfo",
        this.addMenuForm
      );
      if (res.status !== 200) {
        this.$message.error("添加菜单失败！");
      }

      this.$message.success("添加菜单成功！");
      // // 隐藏添加用户的对话框
      this.addDialogVisible = false;
      // 重新获取用户列表数据
      this.getMenuInfo();
    },
    addDialogClosed() {
      this.$refs.addFormRef.resetFields();
    },
    async updateDialog(id) {
      const {data:res} = await this.$http.get("Manager/GetMenuById", {
        params: {
          menuInfoId: id
        }
      });
      // console.log(data)
      this.updateMenuForm = res.data;

      this.updateDialogVisible = true;
    },
    async updateMenuInfo() {
      const {data:res} = await this.$http.put(
        "Manager/UpdateMenuInfo",
        this.updateMenuForm
      );
      if (res.status !== true) {
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
          type: "warning"
        }
      ).catch(err => err);

      // 如果用户确认删除，则返回值为字符串 confirm
      // 如果用户取消了删除，则返回值为字符串 cancel
      // console.log(confirmResult)
      if (confirmResult !== "confirm") {
        return this.$message.info("已取消删除");
      }
      const {data:res} = await this.$http.delete("Manager/DeleteMenuInfo", {
        params: {
          menuInfoId: id
        }
      });
      if (res.status !== 200) {
        return this.$message.error("删除菜单失败！");
      }

      this.$message.success("删除菜单成功！");
      this.getMenuInfo();
    }
  }
};
</script>
<style lang="less" scoped>
</style>