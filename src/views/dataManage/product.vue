<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.title" placeholder="名称" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter('name', )" />
      <el-select v-model="listQuery.state" placeholder="上线?" clearable style="width: 90px" class="filter-item">
        <el-option v-for="item in statusType" :key="item.key" :label="item.name" :value="item.key" />
      </el-select>
      <el-select v-model="listQuery.type" placeholder="类型" clearable class="filter-item" style="width: 130px">
        <el-option v-for="item in bannerType" :key="item.key" :label="item.name" :value="item.key" />
      </el-select>
      <el-select v-model="listQuery.sort" placeholder="时间排序" clearable style="width: 140px" class="filter-item" @change="handleFilter">
        <el-option v-for="item in sortOptions" :key="item.key" :label="item.name" :value="item.key" />
      </el-select>
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        搜索
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
        添加
      </el-button>
      <el-checkbox v-model="showReviewer" class="filter-item" style="margin-left:15px;" @change="tableKey=tableKey+1">
        reviewer
      </el-checkbox>
    </div>

    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;"
      @sort-change="sortChange"
    >
      <el-table-column label="ID" prop="id" sortable="custom" align="center" width="80" :class-name="getSortClass('id')">
        <template slot-scope="scope">
          <span>{{ scope.row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="名称" width="80px">
        <template slot-scope="{row}">
          <span class="link-type" @click="handleUpdate(row)">{{ row.title }}</span>
        </template>
      </el-table-column>
      <el-table-column label="logo图片" class-name="status-col" width="100">
        <template slot-scope="{row}">
          <img :src="row.logoImg" width="100%" height="100%" />
        </template>
      </el-table-column>
      <el-table-column label="商品类型" align="center" width="95">
        <template slot-scope="{row}">
          <span v-if="row.type" class="link-type" @click="handleFetchPv(row.type)">{{ row.type }}</span>
        </template>
      </el-table-column>
      <el-table-column label="规格尺寸">
        <template slot-scope="scope">
          <span>{{ scope.row.spec }}</span>
        </template>
      </el-table-column>
      <el-table-column label="功率" width="40px">
        <template slot-scope="scope">
          <span>{{scope.row.power}}</span>
        </template>
      </el-table-column>
      <el-table-column label="上线" width="40px">
        <template slot-scope="scope">
          <span>{{scope.row.status == 1 ?'是':'否'}}</span>
        </template>
      </el-table-column>
      <el-table-column label="商品标签">
        <template slot-scope="scope">
          <span>{{scope.row.tags}}</span>
        </template>
      </el-table-column>
      <el-table-column label="应用空间" align="center">
        <template slot-scope="scope">
          <span>{{scope.row.applySpace}}</span>
        </template>
      </el-table-column>
      <el-table-column label="商品价格/原价" width="100px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.price }} / {{scope.row.oldPrice||scope.row.price}}</span>
        </template>
      </el-table-column>
      <el-table-column label="商品描述" width="110px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.desc }}</span>
        </template>
      </el-table-column>
      <el-table-column label="排序" width="150px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.sort }}</span>
        </template>
      </el-table-column>
      <el-table-column label="最后修改时间" width="110px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.update_time }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="230" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <el-button type="primary" size="mini" @click="handleUpdate(row)">
            修改
          </el-button>
          <el-button v-if="row.status!='deleted'" size="mini" type="danger" @click="handleModifyStatus(row,'deleted')">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="70px" style="width: 400px; margin-left:50px;">
        <el-form-item label="名称" prop="名称">
          <el-input v-model="temp.title" />
        </el-form-item>
        <el-form-item label="上传图片">
          <el-upload
            action="http://134.175.218.206:8000/api/product/uploadProductImg"
            list-type="picture-card"
            name="productImg"
            :on-success="handleSuccess"
            :on-error="handlePictureCardPreview"
            :on-preview="handlePictureCardPreview"
            :on-remove="handleRemove"
            :before-upload="beforeAvatarUpload"
            :limit="1"
            :file-list="imageLogin"
          >
            <i class="el-icon-plus"></i>
          </el-upload>
          <el-dialog :visible.sync="dialogVisible">
            <img width="100%" :src="dialogImageUrl" alt="">
          </el-dialog>
        </el-form-item>
        <el-form-item label="图片列表">
          <el-upload
            action="http://134.175.218.206:8000/api/product/uploadProductImg"
            list-type="picture-card"
            name="productImg"
            :on-success="handleDescSuccess"
            :on-error="handlePictureCardPreview"
            :on-preview="handlePictureCardPreview"
            :on-remove="handleRemoveDesc"
            :before-upload="beforeAvatarUpload"
            :limit="5"
            :file-list="imageDesc"
          >
            <i class="el-icon-plus"></i>
          </el-upload>
          <el-dialog :visible.sync="dialogVisible">
            <img width="100%" :src="dialogImageUrl" alt="">
          </el-dialog>
        </el-form-item>
        <el-form-item label="规格尺寸">
          <el-input v-model="temp.spec" placeholder="规格尺寸"/>
        </el-form-item>
        <el-form-item label="类型">
          <el-input v-model="temp.type" placeholder="请输入商品的类型"/>
        </el-form-item>
        <el-form-item label="商品标签">
          <el-input v-model="temp.tags" placeholder="商品标签，逗号分割"/>
        </el-form-item>
        <el-form-item label="促销价">
          <el-input v-model="temp.price" placeholder="商品促销价"/>
        </el-form-item>
        <el-form-item label="商品原价">
          <el-input v-model="temp.oldPrice" placeholder="商品原价"/>
        </el-form-item>
        <el-form-item label="功率">
          <el-input v-model="temp.power" placeholder="功率"/>
        </el-form-item>
        <el-form-item label="应用空间">
          <el-input v-model="temp.applySpace" placeholder="请输入应用空间，逗号分割"/>
        </el-form-item>
        <el-form-item label="上线">
          <el-select v-model="temp.status" class="filter-item" placeholder="是否上线">
            <el-option v-for="item in statusType" :key="item.key" :label="item.name" :value="item.key" />
          </el-select>
        </el-form-item>
        <el-form-item label="排序">
          <el-input v-model="temp.sort" />
        </el-form-item>
        <el-form-item label="商品备注">
          <el-input v-model="temp.remark" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="temp.desc" :autosize="{ minRows: 2, maxRows: 4}" type="textarea" placeholder="Please input" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">
          {{dialogStatus==='create'?'添加':'修改'}}
        </el-button>
      </div>
    </el-dialog>

    <el-dialog :visible.sync="dialogPvVisible" title="Reading statistics">
      <el-table :data="pvData" border fit highlight-current-row style="width: 100%">
        <el-table-column prop="key" label="Channel" />
        <el-table-column prop="pv" label="Pv" />
      </el-table>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="dialogPvVisible = false">Confirm</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  import { fetchProductList, addProduct, updateProduct, delProduct } from '@/api/product'
  import { bannerType, bannerTypeVideo } from '@/constants'
  import { groupBy } from 'lodash'
  import waves from '@/directive/waves' // waves directive
  import Pagination from '@/components/Pagination' // secondary package based on el-pagination

  export default {
    name: 'ProductTable',
    components: { Pagination },
    directives: { waves },
    filters: {
      statusFilter(status) {
        const statusMap = {
          published: 'success',
          draft: 'info',
          deleted: 'danger'
        }
        return statusMap[status]
      }
    },
    computed: {
      bannerTypeObj() {
        return groupBy(bannerType, 'key')
      },
      imageLogin() {
        if (this.dialogStatus==='create') {
          return [];
        }
        return [{url: this.temp.logoImg}]
      },
      imageDesc() {
        return this.temp.imgList.map(d => ({
          ...d,
          url: d,
        }));
      },
    },
    data() {
      return {
        tableKey: 0,
        list: [],
        total: 0,
        listLoading: true,
        listQuery: {
          page: 1,
          limit: 10,
          state: undefined,
          title: undefined,
          type: undefined,
          sort: 1
        },
        sortOptions: [{ key: -1, name: '倒序' }, { key: 1, name: '正序' }],
        bannerType: bannerType,
        typeVideo: bannerTypeVideo,
        statusType: [
          {
            key: 0,
            name: '否'
          },
          {
            key: 1,
            name: '是'
          }
        ],
        showReviewer: false,
        temp: {
          id: undefined,
          title: '',
          status: 0,
          logoImg: '',
          imgList: [],
          type: '',
          price: '',
          oldPrice: '',
          tags: '',
          unit: '',
          spec: '',
          power: '',
          applySpace: '',
          hotNum: 0,
          desc: '',
          remark: '',
          sort: 0,
        },
        dialogFormVisible: false,
        dialogStatus: '',
        textMap: {
          update: '修改',
          create: '新增'
        },
        dialogPvVisible: false,
        pvData: [],
        rules: {
          type: [{ required: true, message: 'type is required', trigger: 'change' }],
          timestamp: [{ type: 'date', required: true, message: 'timestamp is required', trigger: 'change' }],
          title: [{ required: true, message: 'title is required', trigger: 'blur' }]
        },
        downloadLoading: false,
        dialogVisible: false,
        dialogImageUrl: '',
        videoForm: {
          // 是否显示进度条
          videoFlag: false,
          // 进度条的进度，
          videoUploadPercent: '',
          // 显示上传按钮
          isShowUploadVideo: false
        }
      }
    },
    created() {
      this.getList()
    },
    methods: {
      getList() {
        this.listLoading = true
        fetchProductList(this.listQuery).then(res => {
          console.log('list:', res)
          this.list = res.list
          this.total = res.count
          // Just to simulate the time of the request
          setTimeout(() => {
            this.listLoading = false
          }, 1.5 * 1000)
        })
      },
      handleFilter() {
        this.listQuery.page = 1
        this.getList()
      },
      async handleModifyStatus(row, status) {
        try{
          await delProduct({id: row.id})
          this.$notify({
            title: 'Success',
            message: 'Delete Successfully',
            type: 'success',
            duration: 2000
          })
          const index = this.list.indexOf(row);
          this.list.splice(index, 1)
        } catch(err) {
          this.$message({
            message: '删除失败',
            type: ''
          });
        }
//        row.status = status
      },
      sortChange(data) {
        const { prop, order } = data
        if (prop === 'id') {
          this.sortByID(order)
        }
      },
      sortByID(order) {
        if (order === 'ascending') {
          this.listQuery.sort = 1
        } else {
          this.listQuery.sort = -1
        }
        this.handleFilter()
      },
      resetTemp() {
        this.temp = {
          id: undefined,
          title: '',
          status: 0,
          logoImg: '',
          imgList: [],
          type: '',
          price: '',
          oldPrice: '',
          tags: '',
          unit: '',
          spec: '',
          power: '',
          applySpace: '',
          hotNum: 0,
          desc: '',
          remark: '',
          sort: 0,
        }
      },
      handleCreate() {
        this.resetTemp()
        this.dialogStatus = 'create'
        this.dialogFormVisible = true
        this.$nextTick(() => {
          this.$refs['dataForm'].clearValidate()
        })
      },
      createData() {
        this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            this.temp.id = parseInt(Math.random() * 100) + 1024 // mock a id
            this.temp.author = 'vue-element-admin'
            addProduct(this.temp).then(() => {
              this.list.unshift(this.temp);
              this.dialogFormVisible = false;
              this.$notify({
                title: 'Success',
                message: 'Created Successfully',
                type: 'success',
                duration: 2000
              })
            })
          }
        })
      },
      handleUpdate(row) {
        this.temp = Object.assign({}, row); // copy obj
        this.temp.timestamp = new Date(this.temp.timestamp);
        this.dialogStatus = 'update';
        this.dialogFormVisible = true;
        this.$nextTick(() => {
          this.$refs['dataForm'].clearValidate()
        })
      },
      updateData() {
        this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            const tempData = Object.assign({}, this.temp);
            tempData.timestamp = +new Date(tempData.timestamp);
            updateProduct(tempData).then(() => {
              for (const v of this.list) {
                if (v.id === this.temp.id) {
                  const index = this.list.indexOf(v);
                  this.list.splice(index, 1, this.temp);
                  break
                }
              }
              this.dialogFormVisible = false;
              this.$notify({
                title: 'Success',
                message: 'Update Successfully',
                type: 'success',
                duration: 2000
              })
            })
          }
        })
      },
      getSortClass: function(key) {
        const sort = this.listQuery.sort
        return sort === `+${key}`
          ? 'ascending'
          : sort === `-${key}`
            ? 'descending'
            : ''
      },
      handleRemove(file, fileList) {
        console.log(file, fileList);
        this.temp.logoImg = '';
      },
      handleRemoveDesc(file, fileList) {
        debugger
        const url = file.url || file.response.url;
        const idx = this.temp.imgList.indexOf(url);
        this.temp.imgList.splice(idx, 1);
      },
      handlePictureCardPreview(file) {
        this.dialogImageUrl = file.url
        this.dialogVisible = true
      },
      handleSuccess(response, file, fileList) {
        this.temp.logoImg = response.url
      },
      handleDescSuccess(response, file, fileList) {
        this.temp.imgList = [...this.temp.imgList, response.url];
      },
      beforeAvatarUpload(file) { // 文件上传之前调用做一些拦截限制
        console.log('beforeAvatarUpload', file)
        const isJPG = true
        // const isJPG = file.type === 'image/jpeg';
        const isLt2M = file.size / 1024 / 1024 < 10
        // if (!isJPG) {
        //   this.$message.error('上传头像图片只能是 JPG 格式!');
        // }
        if (!isLt2M) {
          this.$message.error('上传图片大小不能超过 10MB!')
        }
        return isJPG && isLt2M
      },
      handleExceed(files, fileList) { // 图片上传超过数量限制
        this.$message.error('上传图片不能超过6张!')
        console.log(files, fileList)
      }
    }
  }
</script>
