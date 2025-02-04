// =============================================
// Blog Class - ใช้แทนข้อมูลของแต่ละบล็อก
// =============================================
class Blog {
    constructor(id, title, content, tags = []) {
        this.id = id; // รหัสของบล็อก (ใช้ timestamp เป็น id)
        this.title = title; // หัวข้อของบล็อก
        this.content = content; // เนื้อหาของบล็อก
        this.tags = tags; // รายการแท็ก (Array)
        this.createdDate = new Date(); // วันที่สร้าง
        this.updatedDate = new Date(); // วันที่อัปเดตล่าสุด
    }

    // เมธอดสำหรับอัปเดตข้อมูลของบล็อก
    update(title, content, tags) {
        this.title = title;
        this.content = content;
        this.tags = tags;
        this.updatedDate = new Date(); // อัปเดตวันที่ล่าสุด
    }

    // คืนค่าวันที่อัปเดตในรูปแบบที่อ่านง่าย
    getFormattedDate() {
        return this.updatedDate.toLocaleString("th-TH", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    }
}

// =============================================
// BlogManager Class - จัดการการเก็บข้อมูลบล็อกทั้งหมด
// =============================================
class BlogManager {
    constructor() {
        this.blogs = []; // เก็บบล็อกทั้งหมดในรูปแบบ Array
        this.loadBlogs(); // โหลดข้อมูลจาก LocalStorage เมื่อเปิดเว็บ
    }

    // เพิ่มบล็อกใหม่
    addBlog(title, content, tags) {
        const blog = new Blog(Date.now(), title, content, tags);
        this.blogs.push(blog);
        this.sortBlogs();
        this.saveBlogs(); // บันทึกลง LocalStorage
        return blog;
    }

    // แก้ไขบล็อกที่มีอยู่
    updateBlog(id, title, content, tags) {
        const blog = this.getBlog(id);
        if (blog) {
            blog.update(title, content, tags);
            this.sortBlogs();
            this.saveBlogs();
        }
        return blog;
    }

    // ลบบล็อก
    deleteBlog(id) {
        this.blogs = this.blogs.filter((blog) => blog.id !== id);
        this.saveBlogs();
    }

    // ค้นหาบล็อกจาก id
    getBlog(id) {
        return this.blogs.find((blog) => blog.id === id);
    }

    // กรองบล็อกตามแท็กที่กำหนด
    filterBlogsByTag(tag) {
        return this.blogs.filter((blog) => blog.tags.includes(tag));
    }

    // เรียงลำดับบล็อกโดยใช้วันที่อัปเดตล่าสุด
    sortBlogs() {
        this.blogs.sort((a, b) => new Date(b.updatedDate) - new Date(a.updatedDate));
    }

    // บันทึกบล็อกทั้งหมดลงใน LocalStorage
    saveBlogs() {
        localStorage.setItem("blogs", JSON.stringify(this.blogs));
    }

    // โหลดบล็อกจาก LocalStorage
    loadBlogs() {
        const storedBlogs = localStorage.getItem("blogs");
        this.blogs = storedBlogs ? JSON.parse(storedBlogs).map((data) => 
            new Blog(data.id, data.title, data.content, data.tags)
        ) : [];
        this.sortBlogs();
    }
}

// =============================================
// BlogUI Class - จัดการการแสดงผลบนหน้าเว็บ
// =============================================
class BlogUI {
    constructor(blogManager) {
        this.blogManager = blogManager;
        this.initElements(); // กำหนดค่า HTML Element ที่ใช้งาน
        this.initEventListeners(); // ตั้งค่า Event Listeners
        this.render(); // แสดงรายการบล็อก
        this.updateTagFilter(); // อัปเดตตัวกรองแท็ก
    }

    // กำหนดค่าตัวแปร HTML Element
    initElements() {
        this.form = document.getElementById("blog-form");
        this.titleInput = document.getElementById("title");
        this.contentInput = document.getElementById("content");
        this.tagsInput = document.getElementById("tags");
        this.editIdInput = document.getElementById("edit-id");
        this.formTitle = document.getElementById("form-title");
        this.cancelBtn = document.getElementById("cancel-btn");
        this.blogList = document.getElementById("blog-list");
        this.tagFilter = document.getElementById("tag-filter");
    }

    // ตั้งค่า Event Listeners
    initEventListeners() {
        this.form.addEventListener("submit", (e) => {
            e.preventDefault();
            this.handleSubmit();
        });

        this.cancelBtn.addEventListener("click", () => {
            this.resetForm();
        });
    }

    // จัดการการเพิ่มและแก้ไขบล็อก
    handleSubmit() {
        const title = this.titleInput.value.trim();
        const content = this.contentInput.value.trim();
        const tags = this.tagsInput.value.split(",").map(tag => tag.trim()); // แปลงแท็กเป็น array
        const editId = parseInt(this.editIdInput.value);

        if (title && content) {
            if (editId) {
                this.blogManager.updateBlog(editId, title, content, tags);
            } else {
                this.blogManager.addBlog(title, content, tags);
            }
            this.resetForm();
            this.render();
            this.updateTagFilter();
        }
    }

    // โหลดข้อมูลบล็อกเข้าแบบฟอร์มเพื่อแก้ไข
    editBlog(id) {
        const blog = this.blogManager.getBlog(id);
        if (blog) {
            this.titleInput.value = blog.title;
            this.contentInput.value = blog.content;
            this.tagsInput.value = blog.tags.join(", ");
            this.editIdInput.value = blog.id;
            this.formTitle.textContent = "แก้ไขบล็อก";
            this.cancelBtn.classList.remove("hidden");
            window.scrollTo(0, 0);
        }
    }

    // ลบบล็อก
    deleteBlog(id) {
        if (confirm("ต้องการลบบล็อกนี้ใช่หรือไม่?")) {
            this.blogManager.deleteBlog(id);
            this.render();
            this.updateTagFilter();
        }
    }

    // รีเซ็ตฟอร์มกลับสู่ค่าเริ่มต้น
    resetForm() {
        this.form.reset();
        this.editIdInput.value = "";
        this.formTitle.textContent = "เขียนบล็อกใหม่";
        this.cancelBtn.classList.add("hidden");
    }

    // แสดงรายการบล็อก
    render() {
        this.blogList.innerHTML = this.blogManager.blogs
            .map(
                (blog) => `
                <div class="blog-post">
                    <h2 class="blog-title">${blog.title}</h2>
                    <div class="blog-date">อัปเดตเมื่อ: ${blog.getFormattedDate()}</div>
                    <div class="blog-content">${blog.content.replace(/\n/g, "<br>")}</div>
                    <div class="blog-tags">แท็ก: ${blog.tags.join(", ")}</div>
                    <div class="blog-actions">
                        <button class="btn-edit" onclick="blogUI.editBlog(${blog.id})">แก้ไข</button>
                        <button class="btn-delete" onclick="blogUI.deleteBlog(${blog.id})">ลบ</button>
                    </div>
                </div>
            `
            )
            .join("");
    }

    // กรองบล็อกตามแท็ก
    filterByTag() {
        const selectedTag = this.tagFilter.value;
        const filteredBlogs = selectedTag ? this.blogManager.filterBlogsByTag(selectedTag) : this.blogManager.blogs;
        this.render(filteredBlogs);
    }

    // อัปเดตตัวกรองแท็ก
    updateTagFilter() {
        const tags = [...new Set(this.blogManager.blogs.flatMap(blog => blog.tags))];
        this.tagFilter.innerHTML = '<option value="">-- เลือกแท็ก --</option>';
        tags.forEach(tag => {
            const option = document.createElement("option");
            option.value = tag;
            option.textContent = tag;
            this.tagFilter.appendChild(option);
        });
    }
}

// สร้าง instance และเริ่มใช้งาน
const blogManager = new BlogManager();
const blogUI = new BlogUI(blogManager);