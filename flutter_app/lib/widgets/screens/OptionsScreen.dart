import 'dart:convert';

import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:flutter_app/utils.dart';
import 'package:flutter_webrtc/flutter_webrtc.dart';
import 'package:geolocator/geolocator.dart';
import 'package:http/http.dart' as http;
import 'package:package_info_plus/package_info_plus.dart';
import 'package:provider/provider.dart';

import '../../AppProvider.dart';
import '../../Factory.dart';
import '../../MapNotifier.dart';
import '../../location.dart';
import '../LoadingWidget.dart';
import '../map/map_widget.dart';

class OptionsScreen extends StatefulWidget {
  const OptionsScreen({super.key});

  @override
  OptionsScreenState createState() => OptionsScreenState();
}

class OptionsScreenState extends State<OptionsScreen> {
  final MapNotifier constantAttributes = MapNotifier();
  final MapNotifier constantFilters = MapNotifier();

  final MapNotifier customAttributes = MapNotifier();
  final MapNotifier customFilters = MapNotifier();

  double priority = 0;

  bool loading = true;
  bool unsavedChanges = false;

  @override
  void initState() {
    super.initState();
    constantAttributes.addListener(() {
      if (!mounted) return;
      setState(() {
        unsavedChanges = true;
      });
    });
    constantFilters.addListener(() {
      if (!mounted) return;
      setState(() {
        unsavedChanges = true;
      });
    });

    customAttributes.addListener(() {
      if (!mounted) return;
      setState(() {
        unsavedChanges = true;
      });
    });
    customFilters.addListener(() {
      if (!mounted) return;
      setState(() {
        unsavedChanges = true;
      });
    });
    loadAttributes();
  }

  void loadAttributes() {
    setState(() {
      loading = true;
    });
    FirebaseAuth.instance.currentUser!.getIdToken().then((token) {
      var url = Uri.parse("${Factory.getOptionsHost()}/preferences");
      final headers = {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
        'authorization': token.toString()
      };
      return http.get(url, headers: headers);
    }).then((response) {
      dynamic data = jsonDecode(response.body);
      if (validStatusCode(response.statusCode)) {
      } else {
        String errorMsg =
            (data['message'] ?? 'Failed to load preferences data.').toString();
        SnackBar snackBar = SnackBar(
          content: Text(errorMsg),
        );

        ScaffoldMessenger.of(context).showSnackBar(snackBar);
        Navigator.of(context).pop();
        throw Exception(errorMsg);
      }
      return data;
    }).then((data) {
      if (data["attributes"] is Map && data["attributes"]["constant"] is Map) {
        var temp = data["attributes"]["constant"] as Map;
        constantAttributes.addEntries(temp.entries.map((e) =>
            MapEntry<String, String>(e.key.toString(), e.value.toString())));
      }
      if (data["filters"] is Map && data["filters"]["constant"] is Map) {
        var temp = data["filters"]["constant"] as Map;
        constantFilters.addEntries(temp.entries.map((e) =>
            MapEntry<String, String>(e.key.toString(), e.value.toString())));
      }

      if (data["attributes"] is Map && data["attributes"]["custom"] is Map) {
        var temp = data["attributes"]["custom"] as Map;
        customAttributes.addEntries(temp.entries.map((e) =>
            MapEntry<String, String>(e.key.toString(), e.value.toString())));
      }
      if (data["filters"] is Map && data["filters"]["custom"] is Map) {
        var temp = data["filters"]["custom"] as Map;
        print("loaded temp... ${temp.toString()}");
        customFilters.addEntries(temp.entries.map((e) =>
            MapEntry<String, String>(e.key.toString(), e.value.toString())));
      }

      setState(() {
        priority = data["priority"];
      });
    }).whenComplete(() {
      setState(() {
        unsavedChanges = false;
        loading = false;
      });
    });
  }

  @override
  Widget build(BuildContext context) {
    AppProvider appProvider = Provider.of<AppProvider>(context);
    Widget profile = Container(
        alignment: Alignment.topCenter,
        decoration: BoxDecoration(
          color: Colors.teal,
          borderRadius: BorderRadius.circular(12),
        ),
        padding: const EdgeInsets.all(20),
        margin: const EdgeInsets.all(20),
        constraints: const BoxConstraints(
          maxWidth: 1000,
        ),
        child: loading
            ? connectingWidget
            : Column(
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  const Text(
                    "Profile",
                    style: TextStyle(
                      fontSize: 35.0,
                      fontWeight: FontWeight.bold,
                      color: Colors.black,
                    ),
                  ),
                  const Divider(),
                  UserProfileWidget(
                    priority: priority,
                  ),
                  const Divider(),
                  Container(
                    padding: const EdgeInsets.all(20),
                    child: Column(
                      children: [
                        const Text(
                          'Attributes',
                          style: TextStyle(
                            fontSize: 24.0,
                            fontWeight: FontWeight.bold,
                            color: Colors.black,
                          ),
                        ),
                        DropDownPreference(
                          label: 'Gender',
                          options: const [naValue, "Male", "Female", "Other"],
                          preferenceMap: constantAttributes,
                          mapKey: 'gender',
                        ),
                        DropDownPreference(
                          label: 'Language',
                          options: const [
                            naValue,
                            "English",
                            "French",
                            "Other"
                          ],
                          preferenceMap: constantAttributes,
                          mapKey: 'language',
                        ),
                      ],
                    ),
                  ),
                  const Divider(),
                  Container(
                    padding: const EdgeInsets.all(20),
                    child: Column(
                      children: [
                        const Text(
                          'Filters',
                          style: TextStyle(
                            fontSize: 24.0,
                            fontWeight: FontWeight.bold,
                            color: Colors.black,
                          ),
                        ),
                        DropDownPreference(
                          label: 'Gender',
                          options: const [naValue, "Male", "Female", "Other"],
                          preferenceMap: constantFilters,
                          mapKey: 'gender',
                        ),
                        DropDownPreference(
                          label: 'Language',
                          options: const [
                            naValue,
                            "English",
                            "French",
                            "Other"
                          ],
                          preferenceMap: constantFilters,
                          mapKey: 'language',
                        ),
                      ],
                    ),
                  ),
                  const Divider(),
                  Container(
                    padding: const EdgeInsets.all(20),
                    child: Column(
                      children: [
                        const Text(
                          'Location Settings',
                          style: TextStyle(
                            fontSize: 24.0,
                            fontWeight: FontWeight.bold,
                            color: Colors.black,
                          ),
                        ),
                        LocationOptionsWidget(
                            customAttributes: customAttributes,
                            customFilters: customFilters),
                      ],
                    ),
                  ),
                  SizedBox(
                    height: 50,
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: !unsavedChanges
                          ? null
                          : () async {
                              setState(() {
                                loading = true;
                              });
                              var url = Uri.parse(
                                  "${Factory.getOptionsHost()}/preferences");
                              final headers = {
                                'Access-Control-Allow-Origin': '*',
                                'Content-Type': 'application/json',
                                'authorization': await FirebaseAuth
                                    .instance.currentUser!
                                    .getIdToken()
                              };
                              final body = {
                                'attributes': {
                                  'constant': constantAttributes.map,
                                  'custom': customAttributes.map
                                },
                                'filters': {
                                  'constant': constantFilters.map,
                                  'custom': customFilters.map,
                                }
                              };
                              http
                                  .put(url,
                                      headers: headers, body: json.encode(body))
                                  .then((response) {
                                if (validStatusCode(response.statusCode)) {
                                } else {
                                  const String errorMsg =
                                      'Failed to update preferences.';
                                  const snackBar = SnackBar(
                                    content: Text(errorMsg),
                                  );

                                  ScaffoldMessenger.of(context)
                                      .showSnackBar(snackBar);
                                  Navigator.of(context).pop();
                                }
                                loadAttributes();
                              });
                            },
                      child: const Text('Submit'),
                    ),
                  )
                ],
              ));

    FutureBuilder devices =
        FutureBuilder<List<PopupMenuEntry<MediaDeviceInfo>>>(
      future: appProvider.getDeviceEntries(),
      builder: (context, snapshot) {
        List<Widget> mediaList = [
          const Text(
            "Devices",
            style: TextStyle(
              fontSize: 24.0,
              fontWeight: FontWeight.bold,
              color: Colors.black,
            ),
          )
        ];

        if (snapshot.hasData) {
          mediaList = mediaList + (snapshot.data ?? []);
        }

        return Container(
            alignment: Alignment.topCenter,
            decoration: BoxDecoration(
              color: Colors.teal,
              borderRadius: BorderRadius.circular(12),
            ),
            padding: const EdgeInsets.all(20),
            margin: const EdgeInsets.all(20),
            constraints: const BoxConstraints(
              maxWidth: 1000,
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: mediaList,
            ));
      },
    );

    Widget preferences = FutureBuilder<Options>(
      future: Options.getOptions(),
      builder: (context, snapshot) {
        if (snapshot.hasData) {
          bool confirmFeedbackPopup =
              snapshot.data?.getConfirmFeedbackPopup() ?? true;
          bool autoQueue = snapshot.data?.getAutoQueue() ?? false;
          return Column(children: [
            Row(
              children: [
                const Text("Swipe feedback popup:"),
                Switch(
                  value: confirmFeedbackPopup,
                  onChanged: (bool newValue) async {
                    await snapshot.data?.setConfirmFeedbackPopup(newValue);
                    setState(() {});
                  },
                )
              ],
            ),
            Row(
              children: [
                const Text("Auto queue:"),
                Switch(
                  value: autoQueue,
                  onChanged: (bool newValue) async {
                    await snapshot.data?.setAutoQueue(newValue);
                    setState(() {});
                  },
                )
              ],
            )
          ]);
        } else {
          return const Center(
            child: CircularProgressIndicator(),
          );
        }
      },
    );

    Widget settings = Container(
        alignment: Alignment.topCenter,
        decoration: BoxDecoration(
          color: Colors.teal,
          borderRadius: BorderRadius.circular(12),
        ),
        padding: const EdgeInsets.all(20),
        margin: const EdgeInsets.all(20),
        constraints: const BoxConstraints(
          maxWidth: 1000,
        ),
        child: loading
            ? connectingWidget
            : Column(
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  const Text(
                    "Settings",
                    style: TextStyle(
                      fontSize: 35.0,
                      fontWeight: FontWeight.bold,
                      color: Colors.black,
                    ),
                  ),
                  const Divider(),
                  preferences,
                  const Divider(),
                  devices
                ],
              ));

    return WillPopScope(
        onWillPop: () async {
          if (!unsavedChanges) return true;
          bool confirm = await showDialog(
            context: context,
            builder: (BuildContext context) {
              return AlertDialog(
                title: const Text('You have unsaved changes.'),
                content: const Text('Do you want to discard your changes?'),
                actions: [
                  TextButton(
                    onPressed: () => Navigator.of(context).pop(false),
                    child: const Text('Cancel'),
                  ),
                  TextButton(
                    onPressed: () => Navigator.of(context).pop(true),
                    child: const Text('Discard'),
                  ),
                ],
              );
            },
          );
          return confirm;
        },
        child: Scaffold(
            appBar: AppBar(
              title: const Text('Options screen'),
            ),
            body: Center(
                child: SingleChildScrollView(
                    child: Column(
              children: [profile, settings, const AppDetailsWidget()],
            )))));
  }
}

class KeyValueListWidget extends StatelessWidget {
  final MapNotifier model; // Define a Map to store key-value pairs
  final keyController =
      TextEditingController(); // Controller for the key text field
  final valueController =
      TextEditingController(); // Controller for the value text field

  KeyValueListWidget({super.key, required this.model});

  void _addKeyValue() {
    model.add(keyController.text, valueController.text);
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.max,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        ListView.separated(
          shrinkWrap: true,
          itemCount: model.map.length,
          separatorBuilder: (_, __) => const Divider(),
          itemBuilder: (context, int index) {
            final key = model.map.keys.elementAt(index);
            final value = model.map[key];
            if (value == null) return const SizedBox();
            return OptionTile(
              k: key,
              v: value,
              onDelete: () {
                model.deleteKey(key);
              },
            );
          },
        ),
        const Divider(),
        Row(
            // mainAxisSize: MainAxisSize.max,
            // mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Expanded(
                child: TextField(
                  controller: keyController,
                  maxLines: 1,
                  decoration: const InputDecoration(
                    labelText: 'Key',
                  ),
                ),
              ),
              Expanded(
                child: TextField(
                  controller: valueController,
                  maxLines: 1,
                  decoration: const InputDecoration(
                    labelText: 'Value',
                  ),
                ),
              ),
              ElevatedButton(
                onPressed: _addKeyValue,
                child: const Text('Add'),
              )
            ]),
      ],
    );
  }
}

class OptionTile extends StatelessWidget {
  final String k;
  final String v;

  final VoidCallback onDelete;

  const OptionTile(
      {super.key, required this.k, required this.v, required this.onDelete});

  @override
  Widget build(BuildContext context) {
    return Row(children: [
      Expanded(
        child: Text(k),
      ),
      Expanded(
        child: Text(v),
      ),
      ElevatedButton(
        onPressed: () {
          onDelete();
        },
        child: const Text('Delete'),
      )
    ]);
  }
}

class LocationOptionsWidget extends StatelessWidget {
  final MapNotifier customAttributes;
  final MapNotifier customFilters;

  final valueController =
      TextEditingController(); // Controller for the value text field

  isValid() {
    return customAttributes.get("long") != null &&
        customAttributes.get("lat") != null;
  }

  canReset() {
    return customAttributes.get("long") != null ||
        customAttributes.get("lat") != null ||
        customFilters.get("dist") != null;
  }

  reset() {
    customAttributes.deleteKey('long');
    customAttributes.deleteKey('lat');
    customFilters.deleteKey('dist');
  }

  updateLocation(context) async {
    Position pos = await getLocation().catchError((onError) {
      String errorMsg = onError.toString();
      SnackBar snackBar = SnackBar(
        content: Text(errorMsg),
      );

      ScaffoldMessenger.of(context).showSnackBar(snackBar);
      throw onError;
    });
    customAttributes.add("long", pos.latitude.toString());
    customAttributes.add("lat", pos.longitude.toString());
    print("pos $pos ${pos.latitude} ${pos.longitude}");

    String msg = "Latitude: ${pos.latitude} Longitude: ${pos.longitude}";
    SnackBar snackBar = SnackBar(
      content: Text(msg),
    );

    ScaffoldMessenger.of(context).showSnackBar(snackBar);
  }

  LocationOptionsWidget(
      {super.key, required this.customAttributes, required this.customFilters});

  @override
  Widget build(BuildContext context) {
    Pair<double, double>? posPair;

    String? lat = customAttributes.get("lat");
    String? long = customAttributes.get("long");

    if (long != null && lat != null) {
      try {
        posPair = Pair(double.parse(long), double.parse(lat));
      } catch (e) {
        print('Error: Invalid format for conversion');
        posPair = null;
      }
    }

    double dist = -1;

    valueController.text = customFilters.get('dist') ?? 'None';

    if (customFilters.get('dist') != null) {
      print("customFilters.get('dist') is ${customFilters.get('dist')}");
      try {
        dist = double.parse(customFilters.get('dist')!);
      } catch (e) {
        print('Error: Invalid format for conversion');
        posPair = null;
      }
    } else {
      print("customFilters.get('dist') == null");
    }

    return Column(children: [
      Wrap(
        children: [
          ElevatedButton(
            onPressed: () {
              updateLocation(context);
            },
            child: const Text('Update Location'),
          ),
          ElevatedButton(
            onPressed: canReset() ? reset : null,
            child: const Text('Clear'),
          ),
          isValid()
              ? Text('Max Distance Km: ${dist < 0 ? 'None' : dist.toInt()}')
              : Container()
        ],
      ),
      posPair != null
          ? SizedBox(
              width: 300,
              height: 300,
              child: MapWidget(posPair, dist, true, (double eventDist) {
                print("updating dist value $eventDist");
                customFilters.add('dist', eventDist.toString(), notify: true);
              }),
            )
          : Container(),
    ]);
  }
}

class DropDownPreference extends StatelessWidget {
  final String label;
  final String mapKey;
  final List<String> options;
  final MapNotifier preferenceMap;

  const DropDownPreference(
      {super.key,
      required this.label,
      required this.options,
      required this.preferenceMap,
      required this.mapKey});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
        width: 400,
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text("$label:"),
            SizedBox(
                child: DropdownButton<String>(
              value: preferenceMap.get(mapKey) ?? naValue,
              icon: const Icon(Icons.arrow_drop_down),
              elevation: 16,
              style: const TextStyle(color: Colors.purple),
              underline: Container(
                height: 2,
                color: Colors.purpleAccent,
              ),
              onChanged: (String? value) {
                preferenceMap.add(mapKey, value!);
              },
              items: options.map<DropdownMenuItem<String>>((String value) {
                return DropdownMenuItem<String>(
                    value: value,
                    child: SizedBox(
                      width: 70,
                      child: Text(
                        value,
                        overflow: TextOverflow.ellipsis,
                        maxLines: 1,
                      ),
                    ));
              }).toList(),
            ))
          ],
        ));
  }
}

class UserProfileWidget extends StatelessWidget {
  UserProfileWidget({super.key, required this.priority});

  double priority;

  @override
  Widget build(BuildContext context) {
    User? user = FirebaseAuth.instance.currentUser;

    if (user == null) return const Text("Failed to load user.");

    String? displayName = user.displayName;
    String? email = user.email;

    // for (var element in user.providerData) {
    //   if (element.displayName != null) {
    //     displayName = (displayName ?? "") + element.displayName!;
    //   }
    //   if (element.email != null) {
    //     email = (email ?? "") + element.email!;
    //   }
    // }
    return Column(
      children: [
        user.isAnonymous
            ? Row(
                children: const [Text("This user is Anonymous.")],
              )
            : Column(children: [
                Row(
                  children: [
                    const Text("Display Name: "),
                    Text(displayName ?? "No display name")
                  ],
                ),
                Row(
                  children: [const Text("Email: "), Text(email ?? "No email")],
                ),
              ]),
        Row(
          children: [const Text("Priority: "), Text("$priority")],
        )
      ],
    );
  }
}

class AppDetailsWidget extends StatelessWidget {
  const AppDetailsWidget({super.key});

  @override
  Widget build(BuildContext context) {
    return FutureBuilder(
        future: PackageInfo.fromPlatform(),
        builder: (context, snapshot) {
          String version = "None";

          if (snapshot.hasData && snapshot.data?.version != null) {
            version = snapshot.data?.version ?? "None";
          }

          return Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              ListTile(
                title: const Text("Version", textAlign: TextAlign.center),
                subtitle: Text(version, textAlign: TextAlign.center),
              ),
            ],
          );
        });
  }
}
