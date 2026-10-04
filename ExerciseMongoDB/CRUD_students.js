// Import MongoClient và ObjectId từ thư viện mongodb
const { MongoClient, ObjectId } = require("mongodb");

// Cấu hình chuỗi kết nối và tên Database
const url = "mongodb://127.0.0.1:27017";
const client = new MongoClient(url);
const DB_NAME = "se1900_db";
const COLLECTION_NAME = "Students";

// 1. CREATE - THÊM SINH VIÊN
async function createStudent(collection, studentData) {
  try {
    // Kiểm tra xem studentCode đã tồn tại chưa
    const existing = await collection.findOne({ studentCode: studentData.studentCode });
    if (existing) {
      console.log(`Create Failed: Mã sinh viên "${studentData.studentCode}" đã tồn tại!`);
      return null;
    }

    const result = await collection.insertOne(studentData);
    console.log(`Create success: đã thêm sinh viên "${studentData.fullName}" (Mã: ${studentData.studentCode})`);
    return result;
  } catch (error) {
    console.error("Create error: ", error.message);
    throw error;
  }
}

async function createManyStudents(collection, studentsList) {
  try {
    const result = await collection.insertMany(studentsList);
    console.log(`Create many success: Đã thêm thành công ${result.insertedCount} sinh viên.`);
    return result;
  } catch (error) {
    console.error("Create many error: ", error.message);
    throw error;
  }
}

// 2. READ - ĐỌC & TÌM KIẾM SINH VIÊN
async function getAllStudents(collection) {
  try {
    const students = await collection.find({}).toArray();
    console.log(`Read all success: Tổng số sinh viên tìm thấy: ${students.length}`);
    return students;
  } catch (error) {
    console.error("Read all error: ", error.message);
    throw error;
  }
}

async function getStudentByCode(collection, studentCode) {
  try {
    const student = await collection.findOne({ studentCode: studentCode });
    if (!student) {
      console.log(`Read by code failed: Không tìm thấy sinh viên có mã: ${studentCode}`);
      return null;
    }
    console.log(`Read by code success: Tìm thấy sinh viên:`, student);
    return student;
  } catch (error) {
    console.error("Read by code error: ", error.message);
    throw error;
  }
}

async function getStudentById(collection, id) {
  try {
    const objectId = typeof id === "string" ? new ObjectId(id) : id;
    const student = await collection.findOne({ _id: objectId });
    if (!student) {
      console.log(`Read by id failed: Không tìm thấy sinh viên có _id: ${id}`);
      return null;
    }
    console.log(`Read by id success: Tìm thấy sinh viên:`, student);
    return student;
  } catch (error) {
    console.error("Read by id error: ", error.message);
    throw error;
  }
}

async function getStudentsByFilter(collection, filter = {}) {
  try {
    const students = await collection.find(filter).toArray();
    console.log(`Read by filter success: Điều kiện:`, JSON.stringify(filter), `-> Số lượng: ${students.length}`);
    return students;
  } catch (error) {
    console.error("Read by filter error: ", error.message);
    throw error;
  }
}

// 3. UPDATE - CẬP NHẬT THÔNG TIN SINH VIÊN
async function updateStudentByCode(collection, studentCode, updateData) {
  try {
    const result = await collection.updateOne(
      { studentCode: studentCode },
      { $set: updateData }
    );
    if (result.matchedCount === 0) {
      console.log(`Update failed: Không tìm thấy sinh viên có mã "${studentCode}" để cập nhật.`);
      return result;
    }
    console.log(`Update success: Đã cập nhật thông tin sinh viên mã "${studentCode}". Số bản ghi thay đổi: ${result.modifiedCount}`);
    return result;
  } catch (error) {
    console.error("Update error: ", error.message);
    throw error;
  }
}

async function updateStudentById(collection, id, updateData) {
  try {
    const objectId = typeof id === "string" ? new ObjectId(id) : id;
    const result = await collection.updateOne(
      { _id: objectId },
      { $set: updateData }
    );
    if (result.matchedCount === 0) {
      console.log(`Update failed: Không tìm thấy sinh viên có _id "${id}" để cập nhật.`);
      return result;
    }
    console.log(`Update success: Đã cập nhật sinh viên có _id "${id}".`);
    return result;
  } catch (error) {
    console.error("Update error: ", error.message);
    throw error;
  }
}

async function updateManyStudents(collection, filter, updateData) {
  try {
    const result = await collection.updateMany(filter, { $set: updateData });
    console.log(`Update many success: Khớp ${result.matchedCount} sinh viên, đã cập nhật ${result.modifiedCount} sinh viên.`);
    return result;
  } catch (error) {
    console.error("Update many error: ", error.message);
    throw error;
  }
}

// 4. DELETE - XÓA SINH VIÊN
async function deleteStudentByCode(collection, studentCode) {
  try {
    const result = await collection.deleteOne({ studentCode: studentCode });
    if (result.deletedCount === 0) {
      console.log(`Delete failed: Không tìm thấy sinh viên có mã "${studentCode}" để xóa.`);
      return result;
    }
    console.log(`Delete success: Đã xóa thành công sinh viên có mã "${studentCode}".`);
    return result;
  } catch (error) {
    console.error("Delete error: ", error.message);
    throw error;
  }
}

async function deleteStudentById(collection, id) {
  try {
    const objectId = typeof id === "string" ? new ObjectId(id) : id;
    const result = await collection.deleteOne({ _id: objectId });
    if (result.deletedCount === 0) {
      console.log(`Delete failed: Không tìm thấy sinh viên có _id "${id}" để xóa.`);
      return result;
    }
    console.log(`Delete success: Đã xóa thành công sinh viên có _id "${id}".`);
    return result;
  } catch (error) {
    console.error("Delete error: ", error.message);
    throw error;
  }
}

async function deleteManyStudents(collection, filter) {
  try {
    const result = await collection.deleteMany(filter);
    console.log(`Delete many success: Đã xóa ${result.deletedCount} sinh viên thỏa mãn điều kiện.`);
    return result;
  } catch (error) {
    console.error("Delete many error:", error.message);
    throw error;
  }
}

// HÀM MAIN: DEMO TOÀN BỘ CÁC THAO TÁC CRUD
async function main() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");
    console.log("================================");

    const db = client.db(DB_NAME);
    const students = db.collection(COLLECTION_NAME);

    console.log("Database:", db.databaseName);
    console.log("Collection:", COLLECTION_NAME);
    console.log("================================\n");

    // Đảm bảo studentCode là duy nhất
    await students.createIndex({ studentCode: 1 }, { unique: true });

    // 1. DEMO CREATE (Thêm mới)
    console.log("--- 1. DEMO CREATE ---");

    // Thêm 1 sinh viên (insertOne)
    const student1 = {
      studentCode: "SV013",
      fullName: "Tran Thi Binh",
      gender: "Female",
      dateOfBirth: "2004-07-22",
      email: "binh.tran@example.com",
      major: "Information Technology",
      year: 3,
      gpa: 3.65
    };
    await createStudent(students, student1);

    // Thêm nhiều sinh viên (insertMany)
    const otherStudents = [
      {
        studentCode: "SV014",
        fullName: "Nguyen Van An",
        gender: "Male",
        dateOfBirth: "2003-05-15",
        email: "an.nguyen@example.com",
        major: "Software Engineering",
        year: 4,
        gpa: 3.45
      },
      {
        studentCode: "SV015",
        fullName: "Le Hoang Nam",
        gender: "Male",
        dateOfBirth: "2004-11-09",
        email: "nam.le@example.com",
        major: "Information Technology",
        year: 3,
        gpa: 3.82
      },
      {
        studentCode: "SV016",
        fullName: "Pham Minh Chau",
        gender: "Female",
        dateOfBirth: "2005-02-18",
        email: "chau.pham@example.com",
        major: "Information Assurance",
        year: 2,
        gpa: 3.15
      }
    ];
    // Lọc những sinh viên chưa có trong DB để tránh trùng khóa khi chạy lại
    for (const s of otherStudents) {
      const exists = await students.findOne({ studentCode: s.studentCode });
      if (!exists) {
        await createStudent(students, s);
      }
    }

    // 2. DEMO READ 
    console.log("\n--- 2. DEMO READ ---");

    // Lấy tất cả sinh viên
    const allStudents = await getAllStudents(students);
    console.log("Danh sách tất cả sinh viên:", allStudents);

    // Tìm theo studentCode
    console.log("\nTìm sinh viên SV002:");
    await getStudentByCode(students, "SV002");

    // Tìm sinh viên theo điều kiện (Ngành IT và GPA >= 3.6)
    console.log("\nTìm sinh viên ngành 'Information Technology' có GPA >= 3.6:");
    const topStudents = await getStudentsByFilter(students, {
      major: "Information Technology",
      gpa: { $gte: 3.6 }
    });
    console.log(topStudents);

    // 3. DEMO UPDATE 
    console.log("\n--- 3. DEMO UPDATE ---");

    // Cập nhật GPA và năm học cho SV002
    await updateStudentByCode(students, "SV002", {
      gpa: 3.75,
      year: 4,
      email: "binh.tran.new@example.com"
    });
    console.log("Thông tin SV002 sau cập nhật:");
    await getStudentByCode(students, "SV002");

    // 4. DEMO DELETE 
    console.log("\n--- 4. DEMO DELETE ---");
    await deleteStudentByCode(students, "SV004");

    console.log("\nDanh sách sinh viên sau khi xóa SV004:");
    const remainingStudents = await getAllStudents(students);
    console.table(remainingStudents.map(s => ({
      Mã: s.studentCode,
      Tên: s.fullName,
      Ngành: s.major,
      Năm: s.year,
      GPA: s.gpa
    })));

  } catch (error) {
    console.error("Lỗi trong quá trình thực hiện:", error);
  } finally {
    await client.close();
    console.log("\n================================");
    console.log("Đã đóng kết nối MongoDB.");
  }
}

main();

module.exports = {
  createStudent,
  createManyStudents,
  getAllStudents,
  getStudentByCode,
  getStudentById,
  getStudentsByFilter,
  updateStudentByCode,
  updateStudentById,
  updateManyStudents,
  deleteStudentByCode,
  deleteStudentById,
  deleteManyStudents,
};
