import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useSelector } from "react-redux";
import { base_url } from "../../components/utlis";
import { toast } from "react-toastify";
import { CopyX } from "lucide-react";

const ClientUser = () => {
  const { info, client, isLoading, isError } = useSelector(
    (state) => state.client
  );

  const { token } = useSelector((state) => state.token);

  const [refreshKey, setRefreshKey] = useState(0);

  const handleSubUserCreated = () => {
    setRefreshKey((previous) => previous + 1);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
        Unable to load client information.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-7">
          <p className="mb-1 text-sm font-medium text-blue-600">
            Team management
          </p>

          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            Sub-users
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Create team members and control which sections they can access.
          </p>

          {(info?.agencyname || client?.agencyname) && (
            <div className="mt-4 inline-flex rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm">
              {info?.agencyname || client?.agencyname}
            </div>
          )}
        </div>

        <div className="grid items-start gap-6 xl:grid-cols-[400px_minmax(0,1fr)]">
          <CreateSubuser
            info={info}
            token={token}
            onCreated={handleSubUserCreated}
          />

          <GetSubUser token={token} refreshKey={refreshKey} />
        </div>
      </div>
    </div>
  );
};

export default ClientUser;

const CreateSubuser = ({ info, token, onCreated }) => {
  const initialFormData = {
    name: "",
    email: "",
    password: "",
    access: [],
    status: true,
  };

  const [subUserData, setSubUserData] = useState(initialFormData);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const permissions = useMemo(() => {
    const permissionList = [
      {
        value: "lead.view",
        label: "View leads",
        description: "View the available leads.",
      },
      {
        value: "lead.create",
        label: "Create leads",
        description: "Add new leads to the account.",
      },
      {
        value: "lead.update",
        label: "Update leads",
        description: "Edit lead information and status.",
      },
      {
        value: "lead.delete",
        label: "Delete leads",
        description: "Remove leads from the account.",
      },
    ];

    if (info?.website) {
      permissionList.push(
        {
          value: "website.view",
          label: "View website",
          description: "View website-related information.",
        },
        {
          value: "website.manage",
          label: "Manage website",
          description: "Update and manage website content.",
        }
      );
    }

    return permissionList;
  }, [info?.website]);

  const handleInput = (event) => {
    const { name, value } = event.target;

    setSubUserData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setSuccessMessage("");
  };

  const handlePermissionChange = (permission) => {
    setSubUserData((previous) => {
      const alreadySelected = previous.access.includes(permission);

      return {
        ...previous,
        access: alreadySelected
          ? previous.access.filter((item) => item !== permission)
          : [...previous.access, permission],
      };
    });

    setError("");
    setSuccessMessage("");
  };

  const handleSelectAll = () => {
    setSubUserData((previous) => {
      const allPermissions = permissions.map(
        (permission) => permission.value
      );

      const allSelected = allPermissions.every((permission) =>
        previous.access.includes(permission)
      );

      return {
        ...previous,
        access: allSelected ? [] : allPermissions,
      };
    });
  };

  const handleAddSubUser = async (event) => {
    event.preventDefault();

    setError("");
    setSuccessMessage("");

    const name = subUserData.name.trim();
    const email = subUserData.email.trim().toLowerCase();
    const password = subUserData.password;

    if (!name || !email || !password) {
      setError("Name, email and password are required.");
      return;
    }

    if (password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    if (!token) {
      setError("Authentication token was not found. Please log in again.");
      return;
    }

    try {
      setSubmitLoading(true);

      const response = await fetch(
        `${base_url}/client/subuser/create`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...subUserData,
            name,
            email,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to create the sub-user."
        );
      }

      toast.success(
        data.message || "Sub-user created successfully."
      );

      setSubUserData(initialFormData);
      onCreated?.();
    } catch (requestError) {
      toast.error(
        requestError.message || "Something went wrong."
      );
    } finally {
      setSubmitLoading(false);
    }
  };

  const allPermissionsSelected =
    permissions.length > 0 &&
    permissions.every((permission) =>
      subUserData.access.includes(permission.value)
    );

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
        <h2 className="text-lg font-semibold text-slate-900">
          Create sub-user
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Enter account details and select the required permissions.
        </p>
      </div>

      <form
        onSubmit={handleAddSubUser}
        className="space-y-5 p-5 sm:p-6"
      >
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {successMessage}
          </div>
        )}

        <InputField
          label="Full name"
          name="name"
          type="text"
          placeholder="Enter full name"
          value={subUserData.name}
          onChange={handleInput}
          autoComplete="name"
        />

        <InputField
          label="Email address"
          name="email"
          type="email"
          placeholder="Enter email address"
          value={subUserData.email}
          onChange={handleInput}
          autoComplete="email"
        />

        <InputField
          label="Password"
          name="password"
          type="password"
          placeholder="Minimum 6 characters"
          value={subUserData.password}
          onChange={handleInput}
          autoComplete="new-password"
        />

        <div>
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <label className="text-sm font-semibold text-slate-700">
                Access permissions
              </label>

              <p className="mt-0.5 text-xs text-slate-500">
                Select what this user is allowed to manage.
              </p>
            </div>

            <button
              type="button"
              onClick={handleSelectAll}
              className="shrink-0 text-xs font-semibold text-blue-600 transition hover:text-blue-700"
            >
              {allPermissionsSelected
                ? "Clear all"
                : "Select all"}
            </button>
          </div>

          <div className="space-y-2">
            {permissions.map((permission) => {
              const selected = subUserData.access.includes(
                permission.value
              );

              return (
                <label
                  key={permission.value}
                  className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition ${
                    selected
                      ? "border-blue-300 bg-blue-50"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() =>
                      handlePermissionChange(permission.value)
                    }
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />

                  <span>
                    <span className="block text-sm font-semibold text-slate-800">
                      {permission.label}
                    </span>

                    <span className="mt-0.5 block text-xs leading-5 text-slate-500">
                      {permission.description}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        <label className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-4">
          <span>
            <span className="block text-sm font-semibold text-slate-800">
              Account status
            </span>

            <span className="mt-1 block text-xs text-slate-500">
              The user can log in when the account is active.
            </span>
          </span>

          <input
            type="checkbox"
            checked={subUserData.status}
            onChange={(event) =>
              setSubUserData((previous) => ({
                ...previous,
                status: event.target.checked,
              }))
            }
            className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />
        </label>

        <button
          type="submit"
          disabled={submitLoading}
          className="flex w-full items-center justify-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitLoading ? "Creating user..." : "Create sub-user"}
        </button>
      </form>
    </div>
  );
};

const InputField = ({
  label,
  name,
  type,
  value,
  placeholder,
  onChange,
  autoComplete,
}) => {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block text-sm font-semibold text-slate-700"
      >
        {label}
      </label>

      <input
        id={name}
        name={name}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        autoComplete={autoComplete}
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
      />
    </div>
  );
};

const GetSubUser = ({ token, refreshKey }) => {
  const [subUsers, setSubUsers] = useState([]);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchSubusers = useCallback(
    async (signal) => {
      if (!token) {
        setError("Authentication token was not found.");
        setFetchLoading(false);
        return;
      }

      try {
        setFetchLoading(true);
        setError("");

        const response = await fetch(
          `${base_url}/client/subuser/get`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            signal,
          }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Unable to fetch sub-users."
          );
        }

        setSubUsers(
          Array.isArray(data.subUsers) ? data.subUsers : []
        );
      } catch (requestError) {
        if (requestError.name !== "AbortError") {
          setError(
            requestError.message || "Something went wrong."
          );
        }
      } finally {
        if (!signal?.aborted) {
          setFetchLoading(false);
        }
      }
    },
    [token]
  );

  useEffect(() => {
    const controller = new AbortController();

    fetchSubusers(controller.signal);

    return () => {
      controller.abort();
    };
  }, [fetchSubusers, refreshKey]);


const handelDeleteUser = async(id)=>{
  try {
    const response = await fetch(`${base_url}/client/subuser/delete/${id}`,{
      method:"DELETE",
      headers: {
              Authorization: `Bearer ${token}`,
            },
    })
    const data = await response.json()
    if(data.success){
      toast.success(data.message)
      fetchSubusers()
    }
    else{
      toast.error(data.message)
    }

  } catch (error) {
          toast.error(error?.response?.data?.message)

  }
}

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-5 sm:px-6">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Team members
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            {subUsers.length}{" "}
            {subUsers.length === 1 ? "sub-user" : "sub-users"}
          </p>
        </div>

        <button
          type="button"
          onClick={() => fetchSubusers()}
          disabled={fetchLoading}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="m-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 sm:m-6">
          {error}
        </div>
      )}

      {fetchLoading ? (
        <SubUserLoading />
      ) : subUsers.length === 0 ? (
        <div className="flex min-h-[320px] flex-col items-center justify-center p-6 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-xl font-bold text-slate-500">
            0
          </div>

          <h3 className="mt-4 font-semibold text-slate-900">
            No sub-users found
          </h3>

          <p className="mt-1 max-w-sm text-sm leading-6 text-slate-500">
            Create your first sub-user using the form.
          </p>
        </div>
      ) : (
        <>
          <div className="divide-y divide-slate-100 lg:hidden">
            {subUsers.map((subUser) => (
              <SubUserMobileCard
                key={subUser._id}
                subUser={subUser}
              />
            ))}
          </div>

          <div className="hidden overflow-x-auto lg:block">
            <table className="w-full min-w-[760px] text-left">
              <thead className="bg-slate-50">
                <tr>
                  <TableHeading>User</TableHeading>
                  <TableHeading>Permissions</TableHeading>
                  <TableHeading>Status</TableHeading>
                  <TableHeading>Last login</TableHeading>
                  <TableHeading>Created</TableHeading>
                 <TableHeading>Delete</TableHeading>

                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {subUsers.map((subUser) => (
                  <tr
                    key={subUser._id}
                    className="transition hover:bg-slate-50/70"
                  >
                    <td className="px-5 py-4 sm:px-6">
                      <div className="flex items-center gap-3">
                        <UserAvatar name={subUser.name} />

                        <div>
                          <p className="font-semibold text-slate-900">
                            {subUser.name}
                          </p>

                          <p className="mt-0.5 text-sm text-slate-500">
                            {subUser.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4 sm:px-6">
                      <PermissionBadges access={subUser.access} />
                    </td>

                    <td className="px-5 py-4 sm:px-6">
                      <StatusBadge status={subUser.status} />
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-600 sm:px-6">
                      {formatDate(subUser.lastLogin)}
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-600 sm:px-6">
                      {formatDate(subUser.createdAt)}
                    </td>

                    <td  className="px-5 py-4 text-sm text-slate-600 sm:px-6">
                    <CopyX  onClick={()=>handelDeleteUser(subUser._id)} className="cursor-pointer"/>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

const SubUserMobileCard = ({ subUser }) => {
  return (
    <div className="p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <UserAvatar name={subUser.name} />

          <div className="min-w-0">
            <p className="truncate font-semibold text-slate-900">
              {subUser.name}
            </p>

            <p className="mt-0.5 truncate text-sm text-slate-500">
              {subUser.email}
            </p>
          </div>
        </div>

        <StatusBadge status={subUser.status} />
      </div>

      <div className="mt-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
          Permissions
        </p>

        <PermissionBadges access={subUser.access} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 border-t border-slate-100 pt-4">
        <div>
          <p className="text-xs text-slate-400">Last login</p>
          <p className="mt-1 text-sm font-medium text-slate-700">
            {formatDate(subUser.lastLogin)}
          </p>
        </div>

        <div>
          <p className="text-xs text-slate-400">Created</p>
          <p className="mt-1 text-sm font-medium text-slate-700">
            {formatDate(subUser.createdAt)}
          </p>
        </div>
      </div>
    </div>
  );
};

const UserAvatar = ({ name }) => {
  const firstLetter = name?.trim()?.charAt(0)?.toUpperCase() || "U";

  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">
      {firstLetter}
    </div>
  );
};

const PermissionBadges = ({ access = [] }) => {
  if (!Array.isArray(access) || access.length === 0) {
    return (
      <span className="text-sm text-slate-400">
        No permissions
      </span>
    );
  }

  return (
    <div className="flex max-w-md flex-wrap gap-1.5">
      {access.map((permission) => (
        <span
          key={permission}
          className="rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700"
        >
          {formatPermission(permission)}
        </span>
      ))}
    </div>
  );
};

const StatusBadge = ({ status }) => {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
        status
          ? "bg-emerald-50 text-emerald-700"
          : "bg-red-50 text-red-700"
      }`}
    >
      {status ? "Active" : "Inactive"}
    </span>
  );
};

const TableHeading = ({ children }) => {
  return (
    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:px-6">
      {children}
    </th>
  );
};

const SubUserLoading = () => {
  return (
    <div className="space-y-4 p-5 sm:p-6">
      {[1, 2, 3].map((item) => (
        <div
          key={item}
          className="flex animate-pulse items-center gap-4"
        >
          <div className="h-11 w-11 rounded-full bg-slate-200" />

          <div className="flex-1 space-y-2">
            <div className="h-4 w-36 rounded bg-slate-200" />
            <div className="h-3 w-52 rounded bg-slate-100" />
          </div>

          <div className="h-7 w-16 rounded-full bg-slate-100" />
        </div>
      ))}
    </div>
  );
};

const formatPermission = (permission) => {
  return permission
    .replaceAll(".", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const formatDate = (date) => {
  if (!date) {
    return "Never";
  }

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

