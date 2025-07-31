<script setup></script>

<template>
  <div class="container mx-auto p-4 grow bg-blue-500">
    <div class="flex flex-col gap-4 bg-green-900">
      <ul>
        <li>
          <RouterLink to="/auth/sign-in"> Sign In </RouterLink>
          <RouterLink to="/auth/sign-up"> Sign Up </RouterLink>
          <RouterLink to="/auth/forgot-password"> Forgot Password </RouterLink>
          <RouterLink to="/auth/otp"> OTP </RouterLink>
        </li>
      </ul>
    </div>
    <RouterView />
  </div>
</template>
