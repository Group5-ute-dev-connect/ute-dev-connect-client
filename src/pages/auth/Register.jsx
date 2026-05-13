import RegisterForm from "../../components/auth/RegisterForm";

function Register() {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="grid min-h-screen lg:grid-cols-2">
        <section className="hidden bg-gradient-to-br from-blue-700 via-blue-600 to-cyan-500 px-12 py-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-lg font-bold text-blue-700">
                U
              </div>
              <span className="text-lg font-semibold">UTE Dev Connect</span>
            </div>
          </div>

          <div className="max-w-xl">
            <p className="mb-4 text-sm font-medium uppercase tracking-widest text-blue-100">
              HCMUTE Student Developer Network
            </p>

            <h2 className="text-4xl font-bold leading-tight">
              Nơi sinh viên CNTT kết nối, chia sẻ kiến thức và cùng phát triển.
            </h2>

            <p className="mt-5 text-base leading-7 text-blue-50">
              Tạo tài khoản để cập nhật hồ sơ cá nhân, kết nối bạn bè, chia sẻ
              bài viết học tập và tham gia cộng đồng sinh viên yêu thích lập
              trình.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="rounded-2xl bg-white/15 p-4 backdrop-blur">
              <p className="text-2xl font-bold">01</p>
              <p className="mt-1 text-blue-50">Tạo hồ sơ</p>
            </div>

            <div className="rounded-2xl bg-white/15 p-4 backdrop-blur">
              <p className="text-2xl font-bold">02</p>
              <p className="mt-1 text-blue-50">Kết nối</p>
            </div>

            <div className="rounded-2xl bg-white/15 p-4 backdrop-blur">
              <p className="text-2xl font-bold">03</p>
              <p className="mt-1 text-blue-50">Chia sẻ</p>
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center px-5 py-10">
          <RegisterForm />
        </section>
      </div>
    </main>
  );
}

export default Register;